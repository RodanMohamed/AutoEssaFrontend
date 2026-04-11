import { Injectable, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { AuthStore } from '../../auth/data-access/auth.store';
import { CreateCarRequestLeadPayload } from '../../../core/interfaces/autoessa-endpoints.interface';
import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { BookingRequestItem, CarRequestItem, FavoriteCarItem, UserProfile } from './user.interface';
import { mapBookingRequest, mapCarRequest, mapFavorite } from '../utils/user.mappers';

const USER_PROFILES_STORAGE_KEY = 'autoessa.user.profiles';
const AUTH_REGISTERED_ACCOUNTS_KEY = 'autoessa.auth.accounts';
const PENDING_CAR_REQUESTS_STORAGE_KEY = 'autoessa.user.pending-car-requests';

interface PendingCarRequestRecord {
	ownerId: string;
	ownerEmail: string;
	ownerName: string;
	customerName: string;
	phoneNumber: string;
	desiredCar: string;
	budget: number;
	notes: string;
	createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
	private readonly api = inject(AutoessaApiService);
	private readonly authStore = inject(AuthStore);

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

	getMyCarRequests() {
		return this.api.getMyCarRequests().pipe(
			map((payload) => this.mergePendingCarRequests(this.mapCarRequests(payload))),
			catchError(() => of(this.mergePendingCarRequests([])))
		);
	}

	getPendingCarRequests(): CarRequestItem[] {
		return this.mergePendingCarRequests([]);
	}

	rememberPendingCarRequest(userId: string | undefined, payload: CreateCarRequestLeadPayload): void {
		const session = this.authStore.session();
		const ownerId = userId?.trim() || session?.user.id?.trim() || '';
		const ownerEmail = session?.user.email?.trim().toLowerCase() || '';
		const ownerName = session?.user.fullName?.trim().toLowerCase() || '';
		if (!ownerId && !ownerEmail && !ownerName) {
			return;
		}

		const current = this.readPendingCarRequests();
		current.push({
			ownerId,
			ownerEmail,
			ownerName,
			customerName: payload.fullName.trim(),
			phoneNumber: payload.phoneNumber.trim(),
			desiredCar: `${payload.desiredBrand} ${payload.desiredModel}`.trim(),
			budget: typeof payload.budget === 'number' ? payload.budget : 0,
			notes: typeof payload.notes === 'string' ? payload.notes.trim() : '',
			createdAt: Date.now()
		});
		localStorage.setItem(PENDING_CAR_REQUESTS_STORAGE_KEY, JSON.stringify(current));
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

	mapCarRequests(payload: unknown): CarRequestItem[] {
		const collection = this.extractCollection(payload);
		if (collection.length === 0) {
			return [];
		}

		return collection.map((item, index) => {
			const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
			return mapCarRequest(record, index + 1);
		});
	}

	mergeCarRequestsWithPending(remoteRequests: CarRequestItem[]): CarRequestItem[] {
		return this.mergePendingCarRequests(remoteRequests);
	}

	private mergePendingCarRequests(remoteRequests: CarRequestItem[]): CarRequestItem[] {
		const session = this.authStore.session();
		const sessionId = session?.user.id;
		const sessionEmail = session?.user.email?.trim().toLowerCase() || '';
		const sessionName = session?.user.fullName?.trim().toLowerCase() || '';
		const allPending = this.readPendingCarRequests();

		let scopedPending = allPending
			.filter(
				(item) =>
					(sessionId ? item.ownerId === sessionId : false) ||
					(sessionEmail.length > 0 && item.ownerEmail === sessionEmail) ||
					(sessionName.length > 0 && this.normalize(item.ownerName) === sessionName)
			);

		if (scopedPending.length === 0) {
			scopedPending = allPending;
		}

		const pendingRequests: CarRequestItem[] = scopedPending
			.map((item, index) => ({
				id: `pending-${item.createdAt}-${index}`,
				customerName: item.customerName,
				phoneNumber: item.phoneNumber,
				desiredCar: item.desiredCar,
				budget: item.budget,
				status: 'New'
			}));

		const merged: CarRequestItem[] = [...pendingRequests];
		for (const request of remoteRequests) {
			if (!merged.some((pending) => this.isSameCarRequest(pending, request))) {
				merged.push(request);
			}
		}

		return merged;
	}

	private isSameCarRequest(left: CarRequestItem, right: CarRequestItem): boolean {
		return (
			this.normalize(left.customerName) === this.normalize(right.customerName) &&
			this.normalize(left.phoneNumber) === this.normalize(right.phoneNumber) &&
			this.normalize(left.desiredCar) === this.normalize(right.desiredCar) &&
			left.budget === right.budget
		);
	}

	private readPendingCarRequests(): PendingCarRequestRecord[] {
		const raw = localStorage.getItem(PENDING_CAR_REQUESTS_STORAGE_KEY);
		if (!raw) {
			return [];
		}

		try {
			const parsed = JSON.parse(raw) as unknown;
			if (!Array.isArray(parsed)) {
				return [];
			}

			return parsed
				.filter((item): item is PendingCarRequestRecord => this.isPendingCarRequestRecord(item))
				.map((item) => ({
					...item,
					ownerEmail: typeof item.ownerEmail === 'string' ? item.ownerEmail : '',
					ownerName: typeof item.ownerName === 'string' ? item.ownerName : ''
				}));
		} catch {
			return [];
		}
	}

	private isPendingCarRequestRecord(item: unknown): item is PendingCarRequestRecord {
		if (typeof item !== 'object' || item === null) {
			return false;
		}

		const record = item as Record<string, unknown>;
		const ownerEmail = record['ownerEmail'];
		const ownerName = record['ownerName'];
		return (
			typeof record['ownerId'] === 'string' &&
			(typeof ownerEmail === 'string' || typeof ownerEmail === 'undefined') &&
			(typeof ownerName === 'string' || typeof ownerName === 'undefined') &&
			typeof record['customerName'] === 'string' &&
			typeof record['phoneNumber'] === 'string' &&
			typeof record['desiredCar'] === 'string' &&
			typeof record['budget'] === 'number' &&
			typeof record['createdAt'] === 'number'
		);
	}

	private normalize(value: string): string {
		return value.trim().toLowerCase();
	}

	private extractCollection(payload: unknown): unknown[] {
		if (Array.isArray(payload)) {
			return payload;
		}

		if (typeof payload === 'object' && payload !== null) {
			const source = payload as Record<string, unknown>;
			const candidates = [
				source['items'],
				source['data'],
				source['value'],
				source['results'],
				source['requests'],
				source['bookingRequests'],
				source['carRequests'],
				source['leads']
			];
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

