import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';

import { API_BASE_URL } from '../../../core/core.config';
import { BookingRequestSummary, DashboardStats } from './dashboard.interface';
import { asNumber, asString } from '../utils/dashboard.helpers';
import { DASHBOARD_FALLBACK_STATS } from '../utils/dashboard.constants';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
	private readonly http = inject(HttpClient);

	getStats() {
		return forkJoin({
			cars: this.http.get<unknown>(`${API_BASE_URL}/api/Cars`).pipe(catchError(() => of([]))),
			users: this.http.get<unknown>(`${API_BASE_URL}/api/admin/users`).pipe(catchError(() => of([]))),
			bookings: this.http.get<unknown>(`${API_BASE_URL}/api/admin/bookingrequests`).pipe(catchError(() => of([]))),
			messages: this.http.get<unknown>(`${API_BASE_URL}/api/admin/contact/messages`).pipe(catchError(() => of([])))
		}).pipe(
			map(({ cars, users, bookings, messages }) => {
				const carsCount = Array.isArray(cars) ? cars.length : DASHBOARD_FALLBACK_STATS.totalCars;
				const usersCount = Array.isArray(users) ? users.length : DASHBOARD_FALLBACK_STATS.totalUsers;
				const bookingCount = Array.isArray(bookings) ? bookings.length : DASHBOARD_FALLBACK_STATS.openBookingRequests;
				const messageCount = Array.isArray(messages) ? messages.length : DASHBOARD_FALLBACK_STATS.openContactMessages;

				const result: DashboardStats = {
					totalCars: carsCount,
					totalUsers: usersCount,
					openBookingRequests: bookingCount,
					openContactMessages: messageCount
				};

				return result;
			}),
			catchError(() => of(DASHBOARD_FALLBACK_STATS))
		);
	}

	getLatestBookingRequests() {
		return this.http.get<unknown>(`${API_BASE_URL}/api/admin/bookingrequests`).pipe(
			map((payload) => {
				if (!Array.isArray(payload)) {
					return this.mockBookings();
				}

				return payload.slice(0, 6).map((item, index) => {
					const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};

					const booking: BookingRequestSummary = {
						id: asNumber(record['id'], index + 1),
						customerName: asString(record['customerName'], 'Customer'),
						phone: asString(record['phone'], '-'),
						carTitle: asString(record['carTitle'], 'Selected car'),
						status: asString(record['status'], 'New')
					};

					return booking;
				});
			}),
			catchError(() => of(this.mockBookings()))
		);
	}

	private mockBookings(): BookingRequestSummary[] {
		return [
			{ id: 1, customerName: 'Ahmed Ali', phone: '+20 101 000 0001', carTitle: 'Mercedes C200', status: 'New' },
			{ id: 2, customerName: 'Mona Samir', phone: '+20 101 000 0002', carTitle: 'Toyota Corolla', status: 'Contacted' },
			{ id: 3, customerName: 'Khaled Omar', phone: '+20 101 000 0003', carTitle: 'BMW X3', status: 'New' }
		];
	}
}

