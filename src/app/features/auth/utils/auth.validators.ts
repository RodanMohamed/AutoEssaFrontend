import { Validators } from '@angular/forms';

import { AUTH_EMAIL_REGEX, AUTH_PHONE_REGEX, AUTH_STRONG_PASSWORD_REGEX, AUTH_USERNAME_REGEX } from './auth.constants';

export const AUTH_EMAIL_VALIDATORS = [Validators.required, Validators.email];
export const AUTH_USERNAME_VALIDATORS = [Validators.required, Validators.pattern(AUTH_USERNAME_REGEX)];
export const AUTH_EMAIL_STRICT_VALIDATORS = [Validators.required, Validators.email, Validators.pattern(AUTH_EMAIL_REGEX)];
export const AUTH_PHONE_VALIDATORS = [Validators.required, Validators.pattern(AUTH_PHONE_REGEX)];
export const AUTH_PASSWORD_VALIDATORS = [Validators.required, Validators.pattern(AUTH_STRONG_PASSWORD_REGEX)];

