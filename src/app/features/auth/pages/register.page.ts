import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../data-access/auth.service';
import { AuthFormComponent, AuthFormValue } from '../ui/auth-form.component';
import { LocaleService } from '../../../core/services/locale.service';

@Component({
	selector: 'app-register-page',
	imports: [RouterLink, AuthFormComponent],
	template: `
		<h2 class="auth-title mb-4 text-center text-2xl font-semibold">{{ copy().title }}</h2>
		<app-auth-form mode="register" (submitted)="submit($event)" />
		@if (status()) {
			<p class="status-chip mt-4 text-sm" [class.status-success]="!isError()" [class.status-error]="isError()">{{ status() }}</p>
		}
		<p class="mt-5 text-center text-sm">
			{{ copy().alreadyRegistered }} <a routerLink="/auth/login" class="auth-link">{{ copy().login }}</a>
		</p>
	`,
	styles: `
		.auth-title {
			color: #5a3b22;
			letter-spacing: 0.01em;
		}

		.status-chip {
			border-radius: 0.7rem;
			padding: 0.55rem 0.75rem;
		}

		.status-success {
			background: #edf7eb;
			color: #2f6b2f;
		}

		.status-error {
			background: #fbeae8;
			color: #a33d33;
		}

		.auth-link {
			color: #95653a;
			font-weight: 600;
			text-decoration: underline;
			text-decoration-color: rgba(149, 101, 58, 0.45);
			text-underline-offset: 0.24rem;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export default class RegisterPage {
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);
	private readonly localeService = inject(LocaleService);

	protected readonly status = signal('');
	protected readonly isError = signal(false);
	protected readonly copy = computed(() =>
		this.localeService.locale() === 'ar'
			? {
				title: 'إنشاء حساب',
				alreadyRegistered: 'هل لديك حساب بالفعل؟',
				login: 'تسجيل الدخول'
			}
			: {
				title: 'Create Account',
				alreadyRegistered: 'Already registered?',
				login: 'Login'
			}
	);

	protected submit(value: AuthFormValue) {
		this.status.set('');
		this.isError.set(false);

		this.authService
			.register({
				fullName: value.fullName,
				email: value.email,
				phoneNumber: value.phoneNumber,
				password: value.password
			}, value.username)
			.subscribe({
			next: () => {
				this.status.set('Registration successful.');
				this.router.navigateByUrl('/');
			},
			error: (error: unknown) => {
				this.isError.set(true);
				this.status.set(error instanceof Error ? error.message : 'Unable to register now.');
			}
		});
	}
}

