import { Injectable, inject } from '@angular/core';
import { catchError, map, of, tap, throwError } from 'rxjs';

import { AuthApi } from './auth.api';
import { AuthStore } from './auth.store';
import { LoginRequest, RegisterRequest, RegisteredAccount, ResetPasswordRequest } from './auth.interface';
import { AUTH_REGISTERED_ACCOUNTS_KEY } from '../utils/auth.constants';
import { extractApiErrorMessage, parseRegisteredAccounts } from '../utils/auth.helpers';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly authApi = inject(AuthApi);
	private readonly authStore = inject(AuthStore);

	login(payload: LoginRequest) {
		const localAccount = this.findAccountByEmail(payload.email);

		return this.authApi.login(payload).pipe(
			tap((session) => this.authStore.setSession(session)),
			catchError((error: unknown) => {
				if (localAccount && localAccount.password === payload.password) {
					this.authStore.setSession({
						accessToken: 'local-dev-session-token',
						user: {
							id: 'local-user',
							username: localAccount.username,
							fullName: localAccount.fullName,
							email: localAccount.email,
							role: 'User'
						}
					});

					return of(this.authStore.session()).pipe(
						map((session) => {
							if (!session) {
								throw new Error('Local login failed unexpectedly.');
							}
							return session;
						})
					);
				}

				return throwError(() => new Error(extractApiErrorMessage(error, 'Invalid email or password.')));
			})
		);
	}

	register(payload: RegisterRequest, username: string) {
		if (this.isUsernameTaken(username)) {
			return throwError(() => new Error('Username already exists.'));
		}

		if (this.isEmailTaken(payload.email)) {
			return throwError(() => new Error('Email already exists.'));
		}

		return this.authApi.register(payload).pipe(
			tap((session) => {
				this.authStore.setSession(session);
				this.upsertLocalAccount({
					username,
					fullName: payload.fullName,
					email: payload.email,
					phoneNumber: payload.phoneNumber,
					password: payload.password
				});
			}),
			catchError((error: unknown) => throwError(() => new Error(extractApiErrorMessage(error, 'Registration failed.'))))
		);
	}

	resetPassword(payload: ResetPasswordRequest) {
		if (!this.isEmailTaken(payload.email)) {
			return throwError(() => new Error('Email not found.'));
		}

		this.updateLocalPassword(payload.email, payload.newPassword);
		return of(true);
	}

	isUsernameTaken(username: string): boolean {
		const normalized = username.trim().toLowerCase();
		return this.getLocalAccounts().some((item) => item.username.toLowerCase() === normalized);
	}

	isEmailTaken(email: string): boolean {
		const normalized = email.trim().toLowerCase();
		return this.getLocalAccounts().some((item) => item.email.toLowerCase() === normalized);
	}

	logout() {
		this.authStore.clearSession();
	}

	private getLocalAccounts(): RegisteredAccount[] {
		return parseRegisteredAccounts(localStorage.getItem(AUTH_REGISTERED_ACCOUNTS_KEY));
	}

	private saveLocalAccounts(accounts: RegisteredAccount[]) {
		localStorage.setItem(AUTH_REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
	}

	private upsertLocalAccount(payload: RegisteredAccount) {
		const current = this.getLocalAccounts();
		const filtered = current.filter((item) => item.email.toLowerCase() !== payload.email.toLowerCase());
		filtered.push(payload);
		this.saveLocalAccounts(filtered);
	}

	private updateLocalPassword(email: string, newPassword: string) {
		const targetEmail = email.toLowerCase();
		const updated = this.getLocalAccounts().map((item) => {
			if (item.email.toLowerCase() !== targetEmail) {
				return item;
			}

			return {
				...item,
				password: newPassword
			};
		});
		this.saveLocalAccounts(updated);
	}

	private findAccountByEmail(email: string): RegisteredAccount | null {
		const normalized = email.trim().toLowerCase();
		return this.getLocalAccounts().find((item) => item.email.toLowerCase() === normalized) ?? null;
	}
}

