import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { LocaleService } from '../../../core/services/locale.service';
import { DashboardService } from '../data-access/dashboard.service';
import { BookingRequestSummary, DashboardStats } from '../data-access/dashboard.interface';
import { StatsCardComponent } from '../ui/stats-card.component';

const EN_COPY = {
	title: 'Admin Dashboard',
	cars: 'Cars',
	users: 'Users',
	bookingRequests: 'Booking Requests',
	contactMessages: 'Contact Messages',
	latestBookingRequests: 'Latest Booking Requests',
	name: 'Name',
	phone: 'Phone',
	car: 'Car',
	status: 'Status'
};

const AR_COPY: typeof EN_COPY = {
	title: 'لوحة تحكم الإدارة',
	cars: 'السيارات',
	users: 'المستخدمون',
	bookingRequests: 'طلبات الحجز',
	contactMessages: 'رسائل التواصل',
	latestBookingRequests: 'أحدث طلبات الحجز',
	name: 'الاسم',
	phone: 'الهاتف',
	car: 'السيارة',
	status: 'الحالة'
};

@Component({
	selector: 'app-dashboard-page',
	imports: [StatsCardComponent],
	template: `
		<section class="space-y-6">
			<section class="flex flex-wrap items-center justify-between gap-3">
				<h1 class="font-serif text-3xl">{{ copy().title }}</h1>
			</section>

			<section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<app-stats-card [label]="copy().cars" [value]="stats().totalCars" />
				<app-stats-card [label]="copy().users" [value]="stats().totalUsers" />
				<app-stats-card [label]="copy().bookingRequests" [value]="stats().openBookingRequests" />
				<app-stats-card [label]="copy().contactMessages" [value]="stats().openContactMessages" />
			</section>

			<article class="card border border-base-300 bg-base-100 shadow">
				<div class="card-body">
					<h2 class="card-title">{{ copy().latestBookingRequests }}</h2>
					<div class="overflow-x-auto">
						<table class="table table-zebra">
							<thead>
								<tr>
									<th>{{ copy().name }}</th>
									<th>{{ copy().phone }}</th>
									<th>{{ copy().car }}</th>
									<th>{{ copy().status }}</th>
								</tr>
							</thead>
							<tbody>
								@for (request of latestRequests(); track request.id) {
									<tr>
										<td>{{ request.customerName }}</td>
										<td>{{ request.phone }}</td>
										<td>{{ request.carTitle }}</td>
										<td><span class="badge badge-outline">{{ request.status }}</span></td>
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
export default class DashboardPage {
	private readonly dashboardService = inject(DashboardService);
	private readonly localeService = inject(LocaleService);

	protected readonly stats = signal<DashboardStats>({
		totalCars: 0,
		totalUsers: 0,
		openBookingRequests: 0,
		openContactMessages: 0
	});

	protected readonly latestRequests = signal<BookingRequestSummary[]>([]);
	protected readonly copy = computed(() => (this.localeService.locale() === 'ar' ? AR_COPY : EN_COPY));

	constructor() {
		this.dashboardService.getStats().subscribe((value) => this.stats.set(value));
		this.dashboardService.getLatestBookingRequests().subscribe((value) => this.latestRequests.set(value));
	}
}

