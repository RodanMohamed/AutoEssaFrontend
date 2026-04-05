import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AutoessaApiService } from '../../../core/services/autoessa-api.service';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isBlocked: boolean;
}

interface AdminReview {
  id: string;
  carName: string;
  fullName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
}

@Component({
  selector: 'app-admin-moderation-page',
  imports: [RouterLink],
  template: `
    <section class="space-y-6">
      <section class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-serif text-3xl">Moderation</h1>
        <nav class="tabs tabs-boxed" aria-label="Dashboard sections">
          <a class="tab" routerLink="/dashboard">Overview</a>
          <a class="tab" routerLink="/dashboard/cars">Cars</a>
          <a class="tab" routerLink="/dashboard/requests">Requests</a>
          <a class="tab tab-active" routerLink="/dashboard/moderation">Moderation</a>
          <a class="tab" routerLink="/dashboard/content">Content</a>
        </nav>
      </section>

      @if (message()) {
        <p class="text-sm" [class]="isError() ? 'text-error' : 'text-success'">{{ message() }}</p>
      }

      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <section class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="card-title">Users ({{ usersCount() }})</h2>
            <button class="btn btn-sm" type="button" (click)="loadUsers()">Refresh Users</button>
          </section>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users(); track user.id) {
                  <tr>
                    <td>{{ user.fullName }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.phoneNumber }}</td>
                    <td>{{ user.role }}</td>
                    <td>
                      <span class="badge" [class]="user.isBlocked ? 'badge-error' : 'badge-success'">
                        {{ user.isBlocked ? 'Blocked' : 'Active' }}
                      </span>
                    </td>
                    <td>
                      <div class="flex flex-wrap gap-2">
                        <button class="btn btn-xs" type="button" (click)="toggleBlock(user)">
                          {{ user.isBlocked ? 'Unblock' : 'Block' }}
                        </button>
                        <button class="btn btn-xs btn-error" type="button" (click)="deleteUser(user.id)">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </article>

      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <section class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="card-title">Reviews ({{ reviewsCount() }})</h2>
            <button class="btn btn-sm" type="button" (click)="loadReviews()">Refresh Reviews</button>
          </section>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (review of reviews(); track review.id) {
                  <tr>
                    <td>{{ review.fullName }}</td>
                    <td>{{ review.carName }}</td>
                    <td>{{ review.rating }}</td>
                    <td>{{ review.comment }}</td>
                    <td>
                      <span class="badge" [class]="review.isApproved ? 'badge-success' : 'badge-warning'">
                        {{ review.isApproved ? 'Approved' : 'Pending' }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-xs" type="button" (click)="toggleReviewApproval(review)">
                        {{ review.isApproved ? 'Set Pending' : 'Approve' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AdminModerationPage {
  private readonly api = inject(AutoessaApiService);

  protected readonly users = signal<AdminUser[]>([]);
  protected readonly reviews = signal<AdminReview[]>([]);
  protected readonly message = signal('');
  protected readonly isError = signal(false);

  protected readonly usersCount = computed(() => this.users().length);
  protected readonly reviewsCount = computed(() => this.reviews().length);

  constructor() {
    this.loadUsers();
    this.loadReviews();
  }

  protected loadUsers() {
    this.api.adminGetUsers().subscribe({
      next: (response) => {
        this.users.set(this.mapUsers(response));
      },
      error: () => {
        this.users.set([]);
      }
    });
  }

  protected loadReviews() {
    this.api.adminGetReviews().subscribe({
      next: (response) => {
        this.reviews.set(this.mapReviews(response));
      },
      error: () => {
        this.reviews.set([]);
      }
    });
  }

  protected toggleBlock(user: AdminUser) {
    this.api.adminBlockUser(user.id, { isBlocked: !user.isBlocked }).subscribe({
      next: () => {
        this.message.set(`User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully.`);
        this.isError.set(false);
        this.loadUsers();
      },
      error: (error: unknown) => {
        this.message.set(this.extractError(error));
        this.isError.set(true);
      }
    });
  }

  protected deleteUser(id: string) {
    this.api.adminDeleteUser(id).subscribe({
      next: () => {
        this.message.set('User deleted successfully.');
        this.isError.set(false);
        this.loadUsers();
      },
      error: (error: unknown) => {
        this.message.set(this.extractError(error));
        this.isError.set(true);
      }
    });
  }

  protected toggleReviewApproval(review: AdminReview) {
    this.api.adminUpdateReviewApproval(review.id, { isApproved: !review.isApproved }).subscribe({
      next: () => {
        this.message.set(`Review ${review.isApproved ? 'set to pending' : 'approved'} successfully.`);
        this.isError.set(false);
        this.loadReviews();
      },
      error: (error: unknown) => {
        this.message.set(this.extractError(error));
        this.isError.set(true);
      }
    });
  }

  private mapUsers(payload: unknown): AdminUser[] {
    return this.extractCollection(payload).map((item, index) => {
      const source = this.toRecord(item);
      return {
        id: this.readString(source, 'id', `user-${index + 1}`),
        fullName: this.readString(source, 'fullName', this.readString(source, 'name', 'Unknown')),
        email: this.readString(source, 'email', '-'),
        phoneNumber: this.readString(source, 'phoneNumber', '-'),
        role: this.readString(source, 'role', 'User'),
        isBlocked: this.readBoolean(source, 'isBlocked', false)
      };
    });
  }

  private mapReviews(payload: unknown): AdminReview[] {
    return this.extractCollection(payload).map((item, index) => {
      const source = this.toRecord(item);
      return {
        id: this.readString(source, 'id', `review-${index + 1}`),
        carName: this.readString(source, 'carName', this.readString(source, 'carTitle', 'N/A')),
        fullName: this.readString(source, 'fullName', this.readString(source, 'customerName', 'Unknown')),
        rating: this.readNumber(source, 'rating', 0),
        comment: this.readString(source, 'comment', '-'),
        isApproved: this.readBoolean(source, 'isApproved', false)
      };
    });
  }

  private extractCollection(payload: unknown): unknown[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (typeof payload === 'object' && payload !== null) {
      const source = payload as Record<string, unknown>;
      const candidates = [source['items'], source['data'], source['value']];
      for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
          return candidate;
        }
      }
    }

    return [];
  }

  private toRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  }

  private readString(source: Record<string, unknown>, key: string, fallback: string): string {
    const value = source[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  }

  private readNumber(source: Record<string, unknown>, key: string, fallback: number): number {
    const value = source[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  private readBoolean(source: Record<string, unknown>, key: string, fallback: boolean): boolean {
    const value = source[key];
    return typeof value === 'boolean' ? value : fallback;
  }

  private extractError(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const source = error as Record<string, unknown>;
      const nested = source['error'];
      if (typeof nested === 'string' && nested.trim().length > 0) {
        return nested;
      }
      if (typeof nested === 'object' && nested !== null) {
        const nestedRecord = nested as Record<string, unknown>;
        if (typeof nestedRecord['message'] === 'string') {
          return nestedRecord['message'];
        }
        if (typeof nestedRecord['title'] === 'string') {
          return nestedRecord['title'];
        }
      }
      if (typeof source['message'] === 'string' && source['message'].trim().length > 0) {
        return source['message'];
      }
    }

    return 'Action failed. Please verify API permissions.';
  }
}
