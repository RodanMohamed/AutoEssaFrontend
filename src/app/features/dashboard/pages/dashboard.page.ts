import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { DashboardService } from '../data-access/dashboard.service';
import { BookingRequestSummary, DashboardStats } from '../data-access/dashboard.interface';
import { StatsCardComponent } from '../ui/stats-card.component';

@Component({
	selector: 'app-dashboard-page',
	imports: [StatsCardComponent],
	template: `
		<section class="space-y-6">
			<section class="flex flex-wrap items-center justify-between gap-3">
				<h1 class="font-serif text-3xl">Admin Dashboard</h1>
			</section>

			<section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<app-stats-card label="Cars" [value]="stats().totalCars" />
				<app-stats-card label="Users" [value]="stats().totalUsers" />
				<app-stats-card label="Booking Requests" [value]="stats().openBookingRequests" />
				<app-stats-card label="Contact Messages" [value]="stats().openContactMessages" />
			</section>

			<article class="card border border-base-300 bg-base-100 shadow">
				<div class="card-body">
					<h2 class="card-title">Latest Booking Requests</h2>
					<div class="overflow-x-auto">
						<table class="table table-zebra">
							<thead>
								<tr>
									<th>Name</th>
									<th>Phone</th>
									<th>Car</th>
									<th>Status</th>
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

	protected readonly stats = signal<DashboardStats>({
		totalCars: 0,
		totalUsers: 0,
		openBookingRequests: 0,
		openContactMessages: 0
	});

	protected readonly latestRequests = signal<BookingRequestSummary[]>([]);

	constructor() {
		this.dashboardService.getStats().subscribe((value) => this.stats.set(value));
		this.dashboardService.getLatestBookingRequests().subscribe((value) => this.latestRequests.set(value));
	}
}

