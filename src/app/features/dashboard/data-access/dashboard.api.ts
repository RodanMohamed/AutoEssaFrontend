import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';

import { API_BASE_URL } from '../../../core/core.config';
import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { CarsApi } from '../../cars/data-access/cars.api';
import { BookingRequestSummary, DashboardStats } from './dashboard.interface';
import { asString } from '../utils/dashboard.helpers';
import { DASHBOARD_FALLBACK_STATS } from '../utils/dashboard.constants';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
	private readonly http = inject(HttpClient);
	private readonly autoessaApi = inject(AutoessaApiService);
	private readonly carsApi = inject(CarsApi);

	getStats() {
		return forkJoin({
			cars: this.carsApi.getCars().pipe(catchError(() => of([]))),
			users: this.http.get<unknown>(`${API_BASE_URL}/api/admin/users`).pipe(catchError(() => of([]))),
			bookings: this.http.get<unknown>(`${API_BASE_URL}/api/admin/bookingrequests`).pipe(catchError(() => of([]))),
			messages: this.http.get<unknown>(`${API_BASE_URL}/api/admin/contact/messages`).pipe(catchError(() => of([])))
		}).pipe(
			map(({ cars, users, bookings, messages }) => {
				const carsCount = cars.length;
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
		return this.autoessaApi.adminGetBookingRequests().pipe(
			map((payload) => {
				const items = this.extractCollection(payload);
				return items
					.slice()
					.sort((a, b) => this.compareByLatest(this.toRecord(a), this.toRecord(b)))
					.slice(0, 2)
					.map((item, index) => this.mapBookingSummary(this.toRecord(item), index + 1));
			}),
			catchError(() => of([] as BookingRequestSummary[]))
		);
	}

	private mapBookingSummary(source: Record<string, unknown>, fallbackId: number): BookingRequestSummary {
		const statusNumber = typeof source['status'] === 'number' ? source['status'] : -1;
		return {
			id: asString(source['id'], String(fallbackId)),
			customerName: asString(source['fullName'], asString(source['customerName'], 'Customer')),
			phone: asString(source['phoneNumber'], asString(source['phone'], '-')),
			carTitle: this.extractBookingCarLabel(source),
			status: this.mapStatusLabel(statusNumber, asString(source['status'], 'New'))
		};
	}

	private extractBookingCarLabel(source: Record<string, unknown>): string {
		const carRecord = this.toRecord(source['car']);
		const nestedCarName =
			asString(carRecord['name'], '') ||
			`${asString(carRecord['brand'], '')} ${asString(carRecord['model'], '')}`.trim();
		return (
			asString(source['carName'], '') ||
			asString(source['carTitle'], '') ||
			asString(source['carModel'], '') ||
			nestedCarName ||
			'Selected car'
		);
	}

	private mapStatusLabel(status: number, fallback: string): string {
		if (status === 1) {
			return 'Contacted';
		}
		if (status === 2) {
			return 'Closed';
		}
		if (status === 0) {
			return 'New';
		}
		return fallback;
	}

	private compareByLatest(a: Record<string, unknown>, b: Record<string, unknown>): number {
		const dateA = this.extractTimestamp(a);
		const dateB = this.extractTimestamp(b);
		if (dateA !== dateB) {
			return dateB - dateA;
		}

		const idA = asString(a['id'], '');
		const idB = asString(b['id'], '');
		return idB.localeCompare(idA);
	}

	private extractTimestamp(source: Record<string, unknown>): number {
		const dateCandidate =
			asString(source['createdAt'], '') ||
			asString(source['createdOn'], '') ||
			asString(source['requestDate'], '') ||
			asString(source['startDate'], '');
		const parsed = Date.parse(dateCandidate);
		return Number.isNaN(parsed) ? 0 : parsed;
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
}

