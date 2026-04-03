import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../data-access/auth.service';
import { AuthFormComponent, AuthFormValue } from '../ui/auth-form.component';

@Component({
	selector: 'app-register-page',
	imports: [RouterLink, AuthFormComponent],
	template: `
		<h2 class="mb-4 text-center text-2xl font-semibold">Create Account</h2>
		<app-auth-form mode="register" (submitted)="submit($event)" />
		@if (status()) {
			<p class="mt-3 text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">{{ status() }}</p>
		}
		<p class="mt-4 text-center text-sm">
			Already registered? <a routerLink="/auth/login" class="link link-primary">Login</a>
		</p>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export default class RegisterPage {
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);

	protected readonly status = signal('');
	protected readonly isError = signal(false);

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

