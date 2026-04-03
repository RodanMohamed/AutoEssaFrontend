export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	fullName: string;
	email: string;
	phoneNumber: string;
	password: string;
}

export interface ResetPasswordRequest {
	email: string;
	newPassword: string;
}

export interface AuthUser {
	id: string;
	username: string;
	fullName: string;
	email: string;
	role: 'Admin' | 'User';
}

export interface AuthSession {
	accessToken: string;
	user: AuthUser;
}

export interface RegisteredAccount {
	username: string;
	fullName: string;
	email: string;
	phoneNumber: string;
	password: string;
}

