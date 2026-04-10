import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocaleService } from '../../../core/services/locale.service';
import { BookingRequestItem, CarRequestItem } from '../data-access/user.interface';
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

			<article class="card border border-base-300 bg-base-100 shadow">
				<div class="card-body gap-4">
					<div class="flex items-center justify-between gap-3">
						<h2 class="card-title">{{ copy().carRequestsTitle }} ({{ carRequests().length }})</h2>
						<span class="badge badge-outline">{{ carRequests().length }} {{ copy().carRequestsLabel }}</span>
					</div>
					<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Requested Car</th>
								<th>Budget</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							@for (request of carRequests(); track request.id) {
								<tr>
									<td>{{ request.desiredCar }}</td>
									<td>{{ request.budget | number }} EGP</td>
									<td><span class="badge badge-outline">{{ request.status }}</span></td>
								</tr>
							}
							@if (carRequests().length === 0) {
								<tr>
									<td colspan="3" class="text-center text-sm text-base-content/70">No car requests found.</td>
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

	protected readonly bookingRequests = signal<BookingRequestItem[]>([]);
	protected readonly carRequests = signal<CarRequestItem[]>([]);
	protected readonly copy = computed(() =>
		this.localeService.locale() === 'ar'
			? {
				title: 'طلباتي',
				favoritesTab: 'المفضلة',
				requestsTab: 'الطلبات',
				description: 'تتبع طلبات الحجز وطلبات السيارات التي أرسلتها وحالة المتابعة الحالية.',
				bookingTitle: 'طلبات الحجز',
				bookingBadge: 'الحجوزات',
				carRequestsTitle: 'طلبات السيارات',
				carRequestsLabel: 'طلب'
			}
			: {
				title: 'My Requests',
				favoritesTab: 'Favorites',
				requestsTab: 'Requests',
				description: 'Track your submitted booking requests and car requests in one place.',
				bookingTitle: 'Booking Requests',
				bookingBadge: 'Bookings',
				carRequestsTitle: 'Car Requests',
				carRequestsLabel: 'requests'
			}
	);

	private readonly localeService = inject(LocaleService);

	constructor() {
		this.loadRequests();
	}

	private loadRequests() {
		this.userService.getMyBookingRequests().subscribe({
			next: (payload: unknown) => {
				this.bookingRequests.set(this.userService.mapBookingRequests(payload));
			},
			error: () => {
				this.bookingRequests.set([]);
			}
		});

		this.userService.getMyCarRequests().subscribe({
			next: (payload: unknown) => {
				this.carRequests.set(this.userService.mapCarRequests(payload));
			},
			error: () => {
				this.carRequests.set([]);
			}
		});
	}
}
