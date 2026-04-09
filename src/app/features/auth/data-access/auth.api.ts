import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

import { API_BASE_URL } from '../../../core/core.config';
import { AuthSession, LoginRequest, RegisterRequest } from './auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthApi {
	private readonly http = inject(HttpClient);

	login(payload: LoginRequest) {
		return this.http.post(`${API_BASE_URL}/api/Auth/login`, payload, { responseType: 'text' }).pipe(
			map((response) => this.parseResponseBody(response)),
			map((response) => this.toSession(response, payload.email, payload.email.split('@')[0] ?? 'user', payload.email.split('@')[0] ?? 'User'))
		);
	}

	register(payload: RegisterRequest) {
		return this.http.post(`${API_BASE_URL}/api/Auth/register`, payload, { responseType: 'text' }).pipe(
			map((response) => this.parseResponseBody(response)),
			map((response) => this.toSession(response, payload.email, payload.email.split('@')[0] ?? 'user', payload.fullName))
		);
	}

	private parseResponseBody(value: string): unknown {
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			return {};
		}

		try {
			return JSON.parse(trimmed) as unknown;
		} catch {
			return { raw: value };
		}
	}

	private toSession(response: unknown, email: string, username: string, fullName: string): AuthSession {
		const source = typeof response === 'object' && response !== null ? (response as Record<string, unknown>) : {};
		const tokenValue = source['accessToken'] ?? source['token'] ?? source['jwtToken'];
		const roleValue = source['role'];
		const rolesValue = source['roles'];
		const idValue = source['userId'] ?? source['id'];
		const userNameValue = source['username'];
		const isAdminFromRole = roleValue === 'Admin';
		const isAdminFromRoles = Array.isArray(rolesValue) && rolesValue.some((item) => item === 'Admin');

		return {
			accessToken: typeof tokenValue === 'string' ? tokenValue : 'local-dev-session-token',
			user: {
				id: typeof idValue === 'string' ? idValue : '0',
				username: typeof userNameValue === 'string' ? userNameValue : username,
				fullName,
				email,
				role: isAdminFromRole || isAdminFromRoles ? 'Admin' : 'User'
			}
		};
	}
}

