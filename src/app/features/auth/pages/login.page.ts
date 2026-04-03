import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../data-access/auth.service';
import { AuthFormComponent, AuthFormValue } from '../ui/auth-form.component';

@Component({
	selector: 'app-login-page',
	imports: [RouterLink, AuthFormComponent],
	template: `
		<h2 class="mb-4 text-center text-2xl font-semibold">Login</h2>
		<app-auth-form mode="login" (submitted)="submit($event)" />
		@if (status()) {
			<p class="mt-3 text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">{{ status() }}</p>
		}
		<p class="mt-3 text-center text-sm">
			<a routerLink="/auth/forgot-password" class="link link-secondary">Forgot password?</a>
		</p>
		<p class="mt-2 text-center text-sm">
			No account? <a routerLink="/auth/register" class="link link-primary">Create one</a>
		</p>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export default class LoginPage {
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);

	protected readonly status = signal('');
	protected readonly isError = signal(false);

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
}

