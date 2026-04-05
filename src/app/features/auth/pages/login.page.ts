import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../data-access/auth.service';
import { AuthStore } from '../data-access/auth.store';
import { AuthFormComponent, AuthFormValue } from '../ui/auth-form.component';
import { LocaleService } from '../../../core/services/locale.service';

@Component({
	selector: 'app-login-page',
	imports: [RouterLink, AuthFormComponent],
	template: `
		<h2 class="mb-4 text-center text-2xl font-semibold">{{ copy().title }}</h2>
		<app-auth-form mode="login" (submitted)="submit($event)" />
		<div class="mt-4 rounded-2xl border border-base-300 bg-base-200/60 p-4">
			<p class="text-sm text-base-content/75">Use this only for local UI testing.</p>
			<button type="button" class="btn btn-secondary btn-sm mt-3 w-full" (click)="previewAdmin()">
				Preview Admin Dashboard
			</button>
		</div>
		@if (status()) {
			<p class="mt-3 text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">{{ status() }}</p>
		}
		<p class="mt-3 text-center text-sm">
			<a routerLink="/auth/forgot-password" class="link link-secondary">{{ copy().forgotPassword }}</a>
		</p>
		<p class="mt-2 text-center text-sm">
			{{ copy().noAccount }} <a routerLink="/auth/register" class="link link-primary">{{ copy().createOne }}</a>
		</p>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export default class LoginPage {
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);
	private readonly authStore = inject(AuthStore);
	private readonly localeService = inject(LocaleService);

	protected readonly status = signal('');
	protected readonly isError = signal(false);
	protected readonly copy = computed(() =>
		this.localeService.locale() === 'ar'
			? {
				title: 'تسجيل الدخول',
				forgotPassword: 'نسيت كلمة المرور؟',
				noAccount: 'ليس لديك حساب؟',
				createOne: 'أنشئ حسابًا'
			}
			: {
				title: 'Login',
				forgotPassword: 'Forgot password?',
				noAccount: 'No account?',
				createOne: 'Create one'
			}
	);

	protected submit(value: AuthFormValue) {
		this.status.set('');
		this.isError.set(false);

		this.authService.login({ email: value.email, password: value.password }).subscribe({
			next: (session) => {
				this.status.set('Login successful.');
				const destination = session.user.role === 'Admin' ? '/dashboard' : '/account';
				this.router.navigateByUrl(destination);
			},
			error: (error: unknown) => {
				this.isError.set(true);
				this.status.set(error instanceof Error ? error.message : 'Unable to login now.');
			}
		});
	}

	protected previewAdmin() {
		this.authStore.setSession({
			accessToken: 'dev-admin-token',
			user: {
				id: 'admin-1',
				username: 'admin',
				fullName: 'Admin User',
				email: 'admin@autoessa.local',
				role: 'Admin'
			}
		});
		this.router.navigateByUrl('/dashboard');
	}
}

