import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../data-access/auth.service';
import { AuthFormComponent, AuthFormValue } from '../ui/auth-form.component';
import { LocaleService } from '../../../core/services/locale.service';

@Component({
	selector: 'app-register-page',
	imports: [RouterLink, AuthFormComponent],
	template: `
		<h2 class="mb-4 text-center text-2xl font-semibold">{{ copy().title }}</h2>
		<app-auth-form mode="register" (submitted)="submit($event)" />
		@if (status()) {
			<p class="mt-3 text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">{{ status() }}</p>
		}
		<p class="mt-4 text-center text-sm">
			{{ copy().alreadyRegistered }} <a routerLink="/auth/login" class="link link-primary">{{ copy().login }}</a>
		</p>
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
				this.router.navigateByUrl('/account');
			},
			error: (error: unknown) => {
				this.isError.set(true);
				this.status.set(error instanceof Error ? error.message : 'Unable to register now.');
			}
		});
	}
}

