import { Injectable, inject } from '@angular/core';

import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { BookingRequestItem, FavoriteCarItem, UserProfile } from './user.interface';
import { mapBookingRequest, mapFavorite } from '../utils/user.mappers';

const USER_PROFILES_STORAGE_KEY = 'autoessa.user.profiles';
const AUTH_REGISTERED_ACCOUNTS_KEY = 'autoessa.auth.accounts';

@Injectable({ providedIn: 'root' })
export class UserService {
	private readonly api = inject(AutoessaApiService);

	getProfile(userId: string, seed: UserProfile): UserProfile {
		const profiles = this.readStoredProfiles();
		const saved = profiles[userId];

		if (!saved) {
			return {
				name: seed.name,
				phone: seed.phone,
				email: seed.email
			};
		}

		return {
			name: saved.name || seed.name,
			phone: saved.phone || seed.phone,
			email: saved.email || seed.email
		};
	}

	saveProfile(userId: string, profile: UserProfile): void {
		const profiles = this.readStoredProfiles();
		profiles[userId] = {
			name: profile.name.trim(),
			phone: profile.phone.trim(),
			email: profile.email.trim()
		};
		localStorage.setItem(USER_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
	}

	getLocalRegisteredPhoneByEmail(email: string): string {
		const raw = localStorage.getItem(AUTH_REGISTERED_ACCOUNTS_KEY);
		if (!raw) {
			return '';
		}

		try {
			const parsed = JSON.parse(raw) as unknown;
			if (!Array.isArray(parsed)) {
				return '';
			}

			const normalized = email.trim().toLowerCase();
			for (const item of parsed) {
				if (typeof item !== 'object' || item === null) {
					continue;
				}

				const record = item as Record<string, unknown>;
				const itemEmail = typeof record['email'] === 'string' ? record['email'].trim().toLowerCase() : '';
				if (itemEmail !== normalized) {
					continue;
				}

				return typeof record['phoneNumber'] === 'string' ? record['phoneNumber'] : '';
			}

			return '';
		} catch {
			return '';
		}
	}

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
		const collection = this.extractCollection(payload);
		if (collection.length === 0) {
			return [];
		}

		return collection.map((item, index) => {
			const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
			return mapFavorite(record, index + 1);
		});
	}

	mapBookingRequests(payload: unknown): BookingRequestItem[] {
		const collection = this.extractCollection(payload);
		if (collection.length === 0) {
			return [];
		}

		return collection.map((item, index) => {
			const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
			return mapBookingRequest(record, index + 1);
		});
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

	private readStoredProfiles(): Record<string, UserProfile> {
		const raw = localStorage.getItem(USER_PROFILES_STORAGE_KEY);
		if (!raw) {
			return {};
		}

		try {
			const parsed = JSON.parse(raw) as unknown;
			if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
				return {};
			}

			const entries = Object.entries(parsed as Record<string, unknown>);
			const result: Record<string, UserProfile> = {};

			for (const [key, value] of entries) {
				if (typeof value !== 'object' || value === null) {
					continue;
				}

				const record = value as Record<string, unknown>;
				result[key] = {
					name: typeof record['name'] === 'string' ? record['name'] : '',
					phone: typeof record['phone'] === 'string' ? record['phone'] : '',
					email: typeof record['email'] === 'string' ? record['email'] : ''
				};
			}

			return result;
		} catch {
			return {};
		}
	}
}

