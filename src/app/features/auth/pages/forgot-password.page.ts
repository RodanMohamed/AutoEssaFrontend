import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../data-access/auth.service';
import { AUTH_EMAIL_REGEX, AUTH_STRONG_PASSWORD_REGEX } from '../utils/auth.constants';
import { LocaleService } from '../../../core/services/locale.service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, MatInputModule, MatButtonModule],
  template: `
    <h2 class="mb-4 text-center text-2xl font-semibold">{{ copy().title }}</h2>
    <p class="mb-4 text-center text-sm text-base-content/80">{{ copy().description }}</p>

    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>{{ copy().emailLabel }}</mat-label>
        <input matInput formControlName="email" type="email" />
        @if (form.controls.email.hasError('required')) {
          <mat-error>{{ copy().emailRequired }}</mat-error>
        }
        @if (form.controls.email.hasError('email') || form.controls.email.hasError('pattern')) {
          <mat-error>{{ copy().emailPattern }}</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>{{ copy().newPasswordLabel }}</mat-label>
        <input matInput formControlName="newPassword" type="password" />
        @if (form.controls.newPassword.hasError('required')) {
          <mat-error>{{ copy().newPasswordRequired }}</mat-error>
        }
        @if (form.controls.newPassword.hasError('pattern')) {
          <mat-error>{{ copy().passwordPattern }}</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>{{ copy().confirmPasswordLabel }}</mat-label>
        <input matInput formControlName="confirmPassword" type="password" />
        @if (form.controls.confirmPassword.hasError('required')) {
          <mat-error>{{ copy().confirmPasswordRequired }}</mat-error>
        }
        @if (hasMismatch()) {
          <mat-error>{{ copy().passwordMismatch }}</mat-error>
        }
      </mat-form-field>

      <button mat-flat-button color="primary" class="w-full" type="submit" [disabled]="isSubmitDisabled()">
        {{ copy().submitButton }}
      </button>
    </form>

    @if (status()) {
      <p class="mt-3 text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">{{ status() }}</p>
    }

    <p class="mt-4 text-center text-sm">
      {{ copy().backTo }} <a routerLink="/auth/login" class="link link-primary">{{ copy().login }}</a>
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ForgotPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly localeService = inject(LocaleService);

  protected readonly status = signal('');
  protected readonly isError = signal(false);

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.pattern(AUTH_EMAIL_REGEX)] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(AUTH_STRONG_PASSWORD_REGEX)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  protected readonly hasMismatch = computed(() => {
    const confirm = this.form.controls.confirmPassword.value;
    if (confirm.length === 0) {
      return false;
    }

    return confirm !== this.form.controls.newPassword.value;
  });

  protected readonly isSubmitDisabled = computed(() => this.form.invalid || this.hasMismatch());
  protected readonly copy = computed(() =>
    this.localeService.locale() === 'ar'
      ? {
          title: 'إعادة تعيين كلمة المرور',
          description: 'أدخل بريدك الإلكتروني وأنشئ كلمة مرور جديدة قوية.',
          emailLabel: 'البريد الإلكتروني',
          emailRequired: 'البريد الإلكتروني مطلوب.',
          emailPattern: 'يرجى إدخال صيغة بريد إلكتروني صحيحة.',
          newPasswordLabel: 'كلمة المرور الجديدة',
          newPasswordRequired: 'كلمة المرور الجديدة مطلوبة.',
          passwordPattern: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم ورمز.',
          confirmPasswordLabel: 'تأكيد كلمة المرور',
          confirmPasswordRequired: 'تأكيد كلمة المرور مطلوب.',
          passwordMismatch: 'كلمتا المرور غير متطابقتين.',
          submitButton: 'تعيين كلمة المرور الجديدة',
          backTo: 'العودة إلى',
          login: 'تسجيل الدخول'
        }
      : {
          title: 'Reset Password',
          description: 'Enter your email and create a new strong password.',
          emailLabel: 'Email',
          emailRequired: 'Email is required.',
          emailPattern: 'Please enter a valid email format.',
          newPasswordLabel: 'New password',
          newPasswordRequired: 'New password is required.',
          passwordPattern: 'Password must be at least 8 chars with upper, lower, number, and symbol.',
          confirmPasswordLabel: 'Confirm password',
          confirmPasswordRequired: 'Confirm password is required.',
          passwordMismatch: 'Passwords do not match.',
          submitButton: 'Set New Password',
          backTo: 'Back to',
          login: 'Login'
        }
  );

  protected submit() {
    if (this.isSubmitDisabled()) {
      return;
    }

    this.status.set('');
    this.isError.set(false);

    const value = this.form.getRawValue();
    this.authService.resetPassword({ email: value.email, newPassword: value.newPassword }).subscribe({
      next: () => {
        this.status.set('Password updated successfully. You can login now.');
        this.router.navigateByUrl('/auth/login');
      },
      error: (error: unknown) => {
        this.isError.set(true);
        this.status.set(error instanceof Error ? error.message : 'Unable to reset password now.');
      }
    });
  }
}
