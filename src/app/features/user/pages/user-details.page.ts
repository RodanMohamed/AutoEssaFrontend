import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocaleService } from '../../../core/services/locale.service';
import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { BookingRequestItem } from '../data-access/user.interface';
import { UserService } from '../data-access/user.service';

@Component({
	selector: 'app-user-details-page',
	imports: [RouterLink, DecimalPipe],
	template: `
		<section class="space-y-6">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h1 class="font-serif text-3xl">{{ copy().title }}</h1>
				<nav class="tabs tabs-boxed" aria-label="Account sections">
					<a class="tab" routerLink="/account">{{ copy().favoritesTab }}</a>
					<a class="tab tab-active" routerLink="/account/requests">{{ copy().requestsTab }}</a>
				</nav>
			</div>

			<article class="card border border-base-300 bg-base-100 shadow">
				<div class="card-body gap-4">
					<div class="flex items-center justify-between gap-3">
						<h2 class="card-title">{{ copy().bookingTitle }} ({{ bookingRequests().length }})</h2>
						<span class="badge badge-outline">{{ copy().bookingBadge }}</span>
					</div>
					<p class="text-sm text-base-content/70">{{ copy().description }}</p>
					<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Car</th>
								<th>From</th>
								<th>To</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							@for (request of bookingRequests(); track request.id) {
								<tr>
									<td>{{ request.carTitle }}</td>
									<td>{{ request.fromDate }}</td>
									<td>{{ request.toDate }}</td>
									<td><span class="badge badge-outline">{{ request.status }}</span></td>
								</tr>
							}
							@if (bookingRequests().length === 0) {
								<tr>
									<td colspan="4" class="text-center text-sm text-base-content/70">No booking requests found.</td>
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
export default class UserDetailsPage {
	private readonly userService = inject(UserService);
	private readonly api = inject(AutoessaApiService);

	protected readonly bookingRequests = signal<BookingRequestItem[]>([]);
	protected readonly bookingCarIds = signal<string[]>([]);
	protected readonly carNamesById = signal<Record<string, string>>({});

	protected readonly copy = computed(() =>
		this.localeService.locale() === 'ar'
			? {
				title: 'طلباتي',
				favoritesTab: 'المفضلة',
				requestsTab: 'الطلبات',
				description: 'تتبع جميع طلبات الحجز الخاصة بك.',
				bookingTitle: 'طلبات الحجز',
				bookingBadge: 'الحجوزات'
			}
			: {
				title: 'My Requests',
				favoritesTab: 'Favorites',
				requestsTab: 'Requests',
				description: 'Track your submitted booking requests in one place.',
				bookingTitle: 'Booking Requests',
				bookingBadge: 'Bookings'
			}
	);

	private readonly localeService = inject(LocaleService);

	constructor() {
		this.loadCarsCatalog();
		this.loadRequests();
	}

	private loadRequests() {
		this.userService.getMyBookingRequests().subscribe({
			next: (payload: unknown) => {
				this.bookingRequests.set(this.userService.mapBookingRequests(payload));
				this.bookingCarIds.set(this.extractBookingCarIds(payload));
				this.applyBookingCarNames();
			},
			error: () => {
				this.bookingRequests.set([]);
				this.bookingCarIds.set([]);
			}
		});
	}

	private loadCarsCatalog() {
		this.api.getCars().subscribe({
			next: (response) => {
				const items = this.extractCollection(response);
				const map: Record<string, string> = {};
				for (const item of items) {
					const source = this.toRecord(item);
					const rawId = source['id'];
					const id =
						typeof rawId === 'string'
							? rawId
							: typeof rawId === 'number'
								? String(rawId)
								: '';
					if (!id) {
						continue;
					}

					const name = this.readString(
						source,
						'name',
						`${this.readString(source, 'brand', '')} ${this.readString(source, 'model', '')}`.trim()
					);
					if (name) {
						map[id] = name;
					}
				}

				this.carNamesById.set(map);
				this.applyBookingCarNames();
			}
		});
	}

	private applyBookingCarNames() {
		const ids = this.bookingCarIds();
		if (ids.length === 0) {
			return;
		}

		this.bookingRequests.update((items) =>
			items.map((item, index) => {
				const title = item.carTitle.trim();
				const isPlaceholder = title.length === 0 || title === 'Selected car' || title === 'N/A';
				if (!isPlaceholder) {
					return item;
				}

				const carId = ids[index];
				if (!carId) {
					return item;
				}

				const name = this.carNamesById()[carId];
				if (!name) {
					return item;
				}

				return {
					...item,
					carTitle: name
				};
			})
		);
	}

	private extractBookingCarIds(payload: unknown): string[] {
		const items = this.extractCollection(payload);
		return items.map((item) => {
			const source = this.toRecord(item);
			const nestedCar = this.toRecord(source['car']);
			const rawId = source['carId'] ?? nestedCar['id'];
			if (typeof rawId === 'string') {
				return rawId;
			}
			if (typeof rawId === 'number') {
				return String(rawId);
			}
			return '';
		});
	}

	private extractCollection(payload: unknown): unknown[] {
		if (Array.isArray(payload)) {
			return payload;
		}

		if (typeof payload === 'object' && payload !== null) {
			const source = payload as Record<string, unknown>;
			const candidates = [source['items'], source['data'], source['value'], source['results'], source['requests']];
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
}
