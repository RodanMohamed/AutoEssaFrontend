import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BookingRequestItem } from '../data-access/user.interface';
import { UserService } from '../data-access/user.service';

@Component({
	selector: 'app-user-details-page',
	imports: [RouterLink],
	template: `
		<section class="space-y-6">
			<div class="flex items-center justify-between gap-3">
				<h1 class="font-serif text-3xl">My Booking Requests</h1>
				<a routerLink="/account" class="btn btn-outline btn-sm">Back To Account</a>
			</div>

			<article class="card border border-base-300 bg-base-100 shadow">
				<div class="card-body overflow-x-auto">
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
						</tbody>
					</table>
				</div>
			</article>
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export default class UserDetailsPage {
	private readonly userService = inject(UserService);

	protected readonly bookingRequests = signal<BookingRequestItem[]>([]);

	constructor() {
		this.userService.getMyBookingRequests().subscribe((items) => this.bookingRequests.set(items));
	}
}
