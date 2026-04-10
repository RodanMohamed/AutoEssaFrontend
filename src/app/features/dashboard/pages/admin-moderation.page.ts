import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { LocaleService } from '../../../core/services/locale.service';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isBlocked: boolean;
}

const EN_COPY = {
  title: 'Moderation',
  usersTitle: 'Users',
  refreshUsers: 'Refresh Users',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  role: 'Role',
  status: 'Status',
  actions: 'Actions',
  blocked: 'Blocked',
  active: 'Active',
  unblock: 'Unblock',
  block: 'Block',
  delete: 'Delete',
  userBlockedSuccess: 'User blocked successfully.',
  userUnblockedSuccess: 'User unblocked successfully.',
  userDeletedSuccess: 'User deleted successfully.',
  unknown: 'Unknown',
  userRole: 'User',
  fallbackError: 'Action failed. Please verify API permissions.'
};

const AR_COPY: typeof EN_COPY = {
  title: 'الإشراف',
  usersTitle: 'المستخدمون',
  refreshUsers: 'تحديث المستخدمين',
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  phone: 'الهاتف',
  role: 'الدور',
  status: 'الحالة',
  actions: 'الإجراءات',
  blocked: 'محظور',
  active: 'نشط',
  unblock: 'إلغاء الحظر',
  block: 'حظر',
  delete: 'حذف',
  userBlockedSuccess: 'تم حظر المستخدم بنجاح.',
  userUnblockedSuccess: 'تم إلغاء حظر المستخدم بنجاح.',
  userDeletedSuccess: 'تم حذف المستخدم بنجاح.',
  unknown: 'غير معروف',
  userRole: 'مستخدم',
  fallbackError: 'فشل الإجراء. يرجى التحقق من الصلاحيات.'
};

@Component({
  selector: 'app-admin-moderation-page',
  template: `
    <section class="space-y-6">
      <section class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-serif text-3xl">{{ copy().title }}</h1>
      </section>

      @if (message()) {
        <p class="text-sm" [class]="isError() ? 'text-error' : 'text-success'">{{ message() }}</p>
      }

      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <section class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="card-title">{{ copy().usersTitle }} ({{ usersCount() }})</h2>
            <button class="btn btn-sm" type="button" (click)="loadUsers()">{{ copy().refreshUsers }}</button>
          </section>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>{{ copy().name }}</th>
                  <th>{{ copy().email }}</th>
                  <th>{{ copy().phone }}</th>
                  <th>{{ copy().role }}</th>
                  <th>{{ copy().status }}</th>
                  <th>{{ copy().actions }}</th>
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
                        {{ user.isBlocked ? copy().blocked : copy().active }}
                      </span>
                    </td>
                    <td>
                      <div class="flex flex-wrap gap-2">
                        <button class="btn btn-xs" type="button" (click)="toggleBlock(user)">
                          {{ user.isBlocked ? copy().unblock : copy().block }}
                        </button>
                        <button class="btn btn-xs btn-error" type="button" (click)="deleteUser(user.id)">{{ copy().delete }}</button>
                      </div>
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
  private readonly localeService = inject(LocaleService);

  protected readonly users = signal<AdminUser[]>([]);
  protected readonly message = signal('');
  protected readonly isError = signal(false);
  protected readonly copy = computed(() => (this.localeService.locale() === 'ar' ? AR_COPY : EN_COPY));

  protected readonly usersCount = computed(() => this.users().length);

  constructor() {
    this.loadUsers();
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

  protected toggleBlock(user: AdminUser) {
    this.api.adminBlockUser(user.id, { isBlocked: !user.isBlocked }).subscribe({
      next: () => {
        this.message.set(user.isBlocked ? this.copy().userUnblockedSuccess : this.copy().userBlockedSuccess);
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
        this.message.set(this.copy().userDeletedSuccess);
        this.isError.set(false);
        this.loadUsers();
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
        fullName: this.readString(source, 'fullName', this.readString(source, 'name', this.copy().unknown)),
        email: this.readString(source, 'email', '-'),
        phoneNumber: this.readString(source, 'phoneNumber', '-'),
        role: this.readString(source, 'role', this.copy().userRole),
        isBlocked: this.readBoolean(source, 'isBlocked', false)
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

    return this.copy().fallbackError;
  }
}
