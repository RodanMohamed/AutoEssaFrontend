import { Injectable, computed, effect, signal } from '@angular/core';

import { AUTH_STORAGE_KEY } from '../utils/auth.constants';
import { parseAuthSession } from '../utils/auth.helpers';
import { AuthSession } from './auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthStore {
	readonly session = signal<AuthSession | null>(parseAuthSession(localStorage.getItem(AUTH_STORAGE_KEY)));
	readonly isAuthenticated = computed(() => this.session() !== null);
	readonly isAdmin = computed(() => this.session()?.user.role === 'Admin');
	readonly displayName = computed(() => this.session()?.user.fullName ?? 'Guest');

	constructor() {
		effect(() => {
			const value = this.session();
			if (!value) {
				localStorage.removeItem(AUTH_STORAGE_KEY);
				return;
			}

			localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
		});
	}

	setSession(value: AuthSession) {
		this.session.set(value);
	}

	clearSession() {
		this.session.set(null);
	}
}

