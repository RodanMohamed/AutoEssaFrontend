import { Injectable, computed, signal } from '@angular/core';

import { BookingRequestItem, FavoriteCarItem } from './user.interface';

@Injectable({ providedIn: 'root' })
export class UserStore {
	readonly favorites = signal<FavoriteCarItem[]>([]);
	readonly bookingRequests = signal<BookingRequestItem[]>([]);

	readonly favoritesCount = computed(() => this.favorites().length);
	readonly requestsCount = computed(() => this.bookingRequests().length);
}

