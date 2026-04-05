import { HttpErrorResponse } from '@angular/common/http';

import { AuthSession, RegisteredAccount } from '../data-access/auth.interface';

export function parseAuthSession(value: string | null): AuthSession | null {
	if (!value) {
		return null;
	}

	try {
		const parsed = JSON.parse(value) as Partial<AuthSession>;
		if (!parsed.accessToken || !parsed.user) {
			return null;
		}

		return {
			accessToken: parsed.accessToken,
			user: {
				id: parsed.user.id ?? '0',
				username: parsed.user.username ?? 'user',
				fullName: parsed.user.fullName ?? 'User',
				email: parsed.user.email ?? '-',
				role: parsed.user.role === 'Admin' ? 'Admin' : 'User'
			}
		};
	} catch {
		return null;
	}
}

export function parseRegisteredAccounts(value: string | null): RegisteredAccount[] {
	if (!value) {
		return [];
	}

	try {
		const parsed = JSON.parse(value) as unknown;
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed
			.map((item) => {
				if (typeof item !== 'object' || item === null) {
					return null;
				}

				const record = item as Record<string, unknown>;
				if (
					typeof record['username'] !== 'string' ||
					typeof record['fullName'] !== 'string' ||
					typeof record['email'] !== 'string' ||
					typeof record['phoneNumber'] !== 'string' ||
					typeof record['password'] !== 'string'
				) {
					return null;
				}

				const account: RegisteredAccount = {
					username: record['username'],
					fullName: record['fullName'],
					email: record['email'],
					phoneNumber: record['phoneNumber'],
					password: record['password']
				};

				return account;
			})
			.filter((item): item is RegisteredAccount => item !== null);
	} catch {
		return [];
	}
}

export function extractApiErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof HttpErrorResponse) {
		if (error.status === 0) {
			return 'Network error. Please check your connection and API availability.';
		}

		const payload = error.error;
		if (typeof payload === 'string' && payload.trim().length > 0) {
			return payload;
		}

		if (typeof payload === 'object' && payload !== null) {
			const record = payload as Record<string, unknown>;
			const validationErrors = record['errors'];
			if (Array.isArray(validationErrors)) {
				const first = validationErrors.find((item) => typeof item === 'string' && item.trim().length > 0);
				if (typeof first === 'string') {
					return first;
				}
			}

			if (typeof validationErrors === 'object' && validationErrors !== null) {
				const entries = Object.entries(validationErrors as Record<string, unknown>);
				for (const [, value] of entries) {
					if (Array.isArray(value) && value.length > 0) {
						const first = value.find((item) => typeof item === 'string');
						if (typeof first === 'string' && first.trim().length > 0) {
							return first;
						}
					}
				}
			}

			if (typeof record['message'] === 'string') {
				return record['message'];
			}

			if (typeof record['title'] === 'string') {
				return record['title'];
			}
		}

		if (error.status === 409) {
			return 'Username or email already exists.';
		}
	}

	return fallback;
}

