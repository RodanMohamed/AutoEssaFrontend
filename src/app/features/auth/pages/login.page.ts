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
		<h2 class="auth-title mb-4 text-center text-2xl font-semibold">{{ copy().title }}</h2>
		<app-auth-form mode="login" (submitted)="submit($event)" />
		
		@if (status()) {
			<p class="status-chip mt-4 text-sm" [class.status-success]="!isError()" [class.status-error]="isError()">{{ status() }}</p>
		}
		<p class="mt-4 text-center text-sm">
			<a routerLink="/auth/forgot-password" class="auth-link">{{ copy().forgotPassword }}</a>
		</p>
		<p class="mt-3 text-center text-sm">
			{{ copy().noAccount }} <a routerLink="/auth/register" class="auth-link">{{ copy().createOne }}</a>
		</p>
	`,
	styles: `
		.auth-title {
			color: #5a3b22;
			letter-spacing: 0.01em;
		}

		.dev-preview {
			border: 1px solid #d5b89a;
			background: linear-gradient(145deg, #f7ecde 0%, #f4e4d2 100%);
			color: #65442a;
		}

		.dev-preview .btn {
			background: #bf895a;
			border-color: #bf895a;
			color: #fffaf2;
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
				this.router.navigateByUrl('/');
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
		this.router.navigateByUrl('/');
	}
}

