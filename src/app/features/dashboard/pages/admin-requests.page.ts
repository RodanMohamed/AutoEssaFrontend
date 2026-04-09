import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { AutoessaApiService } from '../../../core/services/autoessa-api.service';

interface AdminBookingRequest {
  id: string;
  customerName: string;
  phoneNumber: string;
  carLabel: string;
  status: number;
  statusLabel: string;
  startDate: string;
  endDate: string;
}

interface AdminCarRequest {
  id: string;
  customerName: string;
  phoneNumber: string;
  desiredCar: string;
  budget: number;
  status: number;
  statusLabel: string;
}

@Component({
  selector: 'app-admin-requests-page',
  template: `
    <section class="space-y-6">
      <section class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-serif text-3xl">Requests Management</h1>
      </section>

      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <section class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="card-title">Booking Requests ({{ bookingCount() }})</h2>
            <button class="btn btn-sm" type="button" (click)="refreshAll()">Refresh</button>
          </section>

          @if (message()) {
            <p class="text-sm" [class]="isError() ? 'text-error' : 'text-success'">{{ message() }}</p>
          }

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Car</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (request of bookingRequests(); track request.id) {
                  <tr>
                    <td>{{ request.customerName }}</td>
                    <td>{{ request.phoneNumber }}</td>
                    <td>{{ request.carLabel }}</td>
                    <td>{{ request.startDate }} → {{ request.endDate }}</td>
                    <td><span class="badge badge-outline">{{ request.statusLabel }}</span></td>
                    <td>
                      <select class="select select-bordered select-sm"
                        [value]="request.status"
                        (change)="updateBookingStatus(request.id, $event)">
                        <option value="0">New</option>
                        <option value="1">Contacted</option>
                        <option value="2">Closed</option>
                      </select>
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
          <h2 class="card-title">Requested Cars ({{ carRequestCount() }})</h2>
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Desired Car</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (request of carRequests(); track request.id) {
                  <tr>
                    <td>{{ request.customerName }}</td>
                    <td>{{ request.phoneNumber }}</td>
                    <td>{{ request.desiredCar }}</td>
                    <td>{{ request.budget }}</td>
                    <td><span class="badge badge-outline">{{ request.statusLabel }}</span></td>
                    <td>
                      <select class="select select-bordered select-sm"
                        [value]="request.status"
                        (change)="updateCarRequestStatus(request.id, $event)">
                        <option value="0">New</option>
                        <option value="1">Contacted</option>
                        <option value="2">Closed</option>
                      </select>
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
export default class AdminRequestsPage {
  private readonly api = inject(AutoessaApiService);

  protected readonly bookingRequests = signal<AdminBookingRequest[]>([]);
  protected readonly carRequests = signal<AdminCarRequest[]>([]);
  protected readonly message = signal('');
  protected readonly isError = signal(false);

  protected readonly bookingCount = computed(() => this.bookingRequests().length);
  protected readonly carRequestCount = computed(() => this.carRequests().length);

  constructor() {
    this.refreshAll();
  }

  protected refreshAll() {
    this.loadBookingRequests();
    this.loadCarRequests();
  }

  protected updateBookingStatus(id: string, event: Event) {
    const target = event.target as HTMLSelectElement | null;
    const status = Number(target?.value ?? '0');

    this.api.adminUpdateBookingRequestStatus(id, { status }).subscribe({
      next: () => {
        this.message.set('Booking request status updated.');
        this.isError.set(false);
        this.loadBookingRequests();
      },
      error: (error: unknown) => {
        this.message.set(this.extractError(error));
        this.isError.set(true);
      }
    });
  }

  protected updateCarRequestStatus(id: string, event: Event) {
    const target = event.target as HTMLSelectElement | null;
    const status = Number(target?.value ?? '0');

    this.api.adminUpdateCarRequestStatus(id, { status }).subscribe({
      next: () => {
        this.message.set('Car request status updated.');
        this.isError.set(false);
        this.loadCarRequests();
      },
      error: (error: unknown) => {
        this.message.set(this.extractError(error));
        this.isError.set(true);
      }
    });
  }

  private loadBookingRequests() {
    this.api.adminGetBookingRequests().subscribe({
      next: (response) => {
        this.bookingRequests.set(this.mapBookingRequests(response));
      },
      error: () => {
        this.bookingRequests.set([]);
      }
    });
  }

  private loadCarRequests() {
    this.api.adminGetCarRequests().subscribe({
      next: (response) => {
        this.carRequests.set(this.mapCarRequests(response));
      },
      error: () => {
        this.carRequests.set([]);
      }
    });
  }

  private mapBookingRequests(payload: unknown): AdminBookingRequest[] {
    const items = this.extractCollection(payload);
    return items.map((item, index) => {
      const source = this.toRecord(item);
      const status = this.readNumber(source, 'status', 0);
      return {
        id: this.readString(source, 'id', `booking-${index + 1}`),
        customerName: this.readString(source, 'fullName', this.readString(source, 'customerName', 'Unknown')),
        phoneNumber: this.readString(source, 'phoneNumber', this.readString(source, 'phone', '-')),
        carLabel: this.readString(source, 'carName', this.readString(source, 'carTitle', 'N/A')),
        status,
        statusLabel: this.statusLabel(status),
        startDate: this.readString(source, 'startDate', '-'),
        endDate: this.readString(source, 'endDate', '-')
      };
    });
  }

  private mapCarRequests(payload: unknown): AdminCarRequest[] {
    const items = this.extractCollection(payload);
    return items.map((item, index) => {
      const source = this.toRecord(item);
      const status = this.readNumber(source, 'status', 0);
      const desiredBrand = this.readString(source, 'desiredBrand', '');
      const desiredModel = this.readString(source, 'desiredModel', '');
      return {
        id: this.readString(source, 'id', `lead-${index + 1}`),
        customerName: this.readString(source, 'fullName', this.readString(source, 'customerName', 'Unknown')),
        phoneNumber: this.readString(source, 'phoneNumber', this.readString(source, 'phone', '-')),
        desiredCar: `${desiredBrand} ${desiredModel}`.trim() || this.readString(source, 'desiredCar', 'N/A'),
        budget: this.readNumber(source, 'budget', 0),
        status,
        statusLabel: this.statusLabel(status)
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

  private statusLabel(status: number): string {
    if (status === 1) {
      return 'Contacted';
    }
    if (status === 2) {
      return 'Closed';
    }
    return 'New';
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

    return 'Request failed. Please verify API role permissions.';
  }
}
