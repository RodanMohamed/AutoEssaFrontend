import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { API_BASE_URL } from '../../../core/core.config';
import { BookingRequestItem, FavoriteCarItem } from './user.interface';
import { mapBookingRequest, mapFavorite } from '../utils/user.mappers';

@Injectable({ providedIn: 'root' })
export class UserApi {
	private readonly http = inject(HttpClient);

	getMyFavorites() {
		return this.http.get<unknown>(`${API_BASE_URL}/api/Favorites/me`).pipe(
			map((payload) => {
				if (!Array.isArray(payload)) {
					return this.mockFavorites();
				}

				return payload.map((item, index) => {
					const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
					return mapFavorite(record, index + 1);
				});
			}),
			catchError(() => of(this.mockFavorites()))
		);
	}

	getMyBookingRequests() {
		return this.http.get<unknown>(`${API_BASE_URL}/api/BookingRequests/me`).pipe(
			map((payload) => {
				if (!Array.isArray(payload)) {
					return this.mockRequests();
				}

				return payload.map((item, index) => {
					const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
					return mapBookingRequest(record, index + 1);
				});
			}),
			catchError(() => of(this.mockRequests()))
		);
	}

	private mockFavorites(): FavoriteCarItem[] {
		return [
			{
				id: '1',
				brand: 'Mercedes',
				model: 'C200',
				year: 2023,
				price: 5500,
				imageUrl: 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=1200&q=80'
			},
			{
				id: '2',
				brand: 'BMW',
				model: 'X3',
				year: 2024,
				price: 7600,
				imageUrl: 'https://images.unsplash.com/photo-1549925862-990f9be5f0f8?auto=format&fit=crop&w=1200&q=80'
			}
		];
	}

	private mockRequests(): BookingRequestItem[] {
		return [
			{ id: 1, carTitle: 'Mercedes C200', fromDate: '2026-04-15', toDate: '2026-04-18', status: 'New' },
			{ id: 2, carTitle: 'Toyota Corolla', fromDate: '2026-04-20', toDate: '2026-04-22', status: 'Contacted' }
		];
	}
}

