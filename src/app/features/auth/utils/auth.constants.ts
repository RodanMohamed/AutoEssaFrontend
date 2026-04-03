export const AUTH_STORAGE_KEY = 'autoessa.auth.session';
export const AUTH_REGISTERED_ACCOUNTS_KEY = 'autoessa.auth.accounts';

export const AUTH_USERNAME_REGEX = /^[A-Za-z_]{3,30}$/;
export const AUTH_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const AUTH_STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
export const AUTH_PHONE_REGEX = /^(?:\+20|0)?1[0-2,5]\d{8}$/;

