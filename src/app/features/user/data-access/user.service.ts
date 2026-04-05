import { Injectable, inject } from '@angular/core';

import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { BookingRequestItem, FavoriteCarItem } from './user.interface';
import { mapBookingRequest, mapFavorite } from '../utils/user.mappers';

@Injectable({ providedIn: 'root' })
export class UserService {
	private readonly api = inject(AutoessaApiService);

	getMyFavorites() {
		return this.api.getMyFavorites();
	}

	getMyBookingRequests() {
		return this.api.getMyBookingRequests();
	}

	removeFavorite(carId: string) {
		return this.api.removeFavorite(carId);
	}

	mapFavorites(payload: unknown): FavoriteCarItem[] {
		if (!Array.isArray(payload)) {
			return [];
		}

		return payload.map((item, index) => {
			const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
			return mapFavorite(record, index + 1);
		});
	}

	mapBookingRequests(payload: unknown): BookingRequestItem[] {
		if (!Array.isArray(payload)) {
			return [];
		}

		return payload.map((item, index) => {
			const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
			return mapBookingRequest(record, index + 1);
		});
	}
}

