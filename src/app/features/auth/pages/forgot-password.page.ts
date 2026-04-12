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
    <h2 class="auth-title mb-3 text-center text-2xl font-semibold">{{ copy().title }}</h2>
    <p class="auth-description mb-5 text-center text-sm">{{ copy().description }}</p>

    <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
      <mat-form-field appearance="outline" class="auth-field w-full">
        <mat-label>{{ copy().emailLabel }}</mat-label>
        <input matInput formControlName="email" type="email" />
        @if (form.controls.email.hasError('required')) {
          <mat-error>{{ copy().emailRequired }}</mat-error>
        }
        @if (form.controls.email.hasError('email') || form.controls.email.hasError('pattern')) {
          <mat-error>{{ copy().emailPattern }}</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="auth-field w-full">
        <mat-label>{{ copy().newPasswordLabel }}</mat-label>
        <input matInput formControlName="newPassword" type="password" />
        @if (form.controls.newPassword.hasError('required')) {
          <mat-error>{{ copy().newPasswordRequired }}</mat-error>
        }
        @if (form.controls.newPassword.hasError('pattern')) {
          <mat-error>{{ copy().passwordPattern }}</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="auth-field w-full">
        <mat-label>{{ copy().confirmPasswordLabel }}</mat-label>
        <input matInput formControlName="confirmPassword" type="password" />
        @if (form.controls.confirmPassword.hasError('required')) {
          <mat-error>{{ copy().confirmPasswordRequired }}</mat-error>
        }
        @if (hasMismatch()) {
          <mat-error>{{ copy().passwordMismatch }}</mat-error>
        }
      </mat-form-field>

      @if (isSubmitDisabled()) {
        <p class="validation-alert text-sm">{{ validationMessage() }}</p>
      }

      <button mat-flat-button color="primary" class="auth-submit w-full" type="submit" [disabled]="isSubmitDisabled()">
        {{ copy().submitButton }}
      </button>
    </form>

    @if (status()) {
      <p class="status-chip mt-4 text-sm" [class.status-success]="!isError()" [class.status-error]="isError()">{{ status() }}</p>
    }

    <p class="mt-5 text-center text-sm">
      {{ copy().backTo }} <a routerLink="/auth/login" class="auth-link">{{ copy().login }}</a>
    </p>
  `,
  styles: `
    .auth-title {
      color: #5a3b22;
      letter-spacing: 0.01em;
    }

    .auth-description {
      color: #77583d;
      line-height: 1.6;
    }

    .auth-form {
      display: grid;
      gap: 0.65rem;
    }

    .auth-field {
      margin-bottom: 0.2rem;
    }

    .auth-submit {
      margin-top: 0.45rem;
      min-height: 2.9rem;
      border-radius: 0.9rem;
      letter-spacing: 0.02em;
      font-weight: 700;
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

    :host ::ng-deep .auth-field .mat-mdc-text-field-wrapper {
      border-radius: 0.85rem;
      background: rgba(255, 248, 238, 0.82);
    }

    :host ::ng-deep .auth-field .mdc-notched-outline__leading,
    :host ::ng-deep .auth-field .mdc-notched-outline__notch,
    :host ::ng-deep .auth-field .mdc-notched-outline__trailing {
      border-color: #ceb192;
    }

    :host ::ng-deep .auth-field.mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .auth-field.mat-focused .mdc-notched-outline__notch,
    :host ::ng-deep .auth-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #b68456;
      border-width: 2px;
    }

    :host ::ng-deep .auth-field .mdc-floating-label,
    :host ::ng-deep .auth-field .mat-mdc-input-element,
    :host ::ng-deep .auth-field .mat-mdc-form-field-error {
      color: #5f3f24;
    }

    :host ::ng-deep .auth-submit {
      background: linear-gradient(135deg, #c89261 0%, #b57a4a 100%);
      color: #fff8ef;
      box-shadow: 0 12px 25px rgba(151, 97, 51, 0.28);
    }

    :host ::ng-deep .auth-submit:disabled {
      opacity: 0.58;
      box-shadow: none;
    }

    .validation-alert {
      background: #fef3e2;
      color: #92672f;
      border-left: 3px solid #d4a574;
      padding: 0.65rem;
      border-radius: 0.5rem;
      margin-top: -0.25rem;
      margin-bottom: 0.5rem;
    }
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

  protected readonly validationMessage = computed(() => {
    const isArabic = this.localeService.locale() === 'ar';
    const email = this.form.controls.email;
    const password = this.form.controls.newPassword;
    const confirm = this.form.controls.confirmPassword;

    if (email.invalid) {
      return isArabic ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address';
    }
    if (password.invalid) {
      return isArabic ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل مع أحرف كبيرة وصغيرة وأرقام ورموز' : 'Password must be at least 8 chars with upper, lower, number, and symbol';
    }
    if (confirm.invalid) {
      return isArabic ? 'يرجى تأكيد كلمة المرور' : 'Please confirm your password';
    }
    if (this.hasMismatch()) {
      return isArabic ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
    }
    return isArabic ? 'يرجى إكمال كل الحقول' : 'Please complete all fields';
  });
  protected readonly copy = computed(() =>
    this.localeService.locale() === 'ar'
      ? {
          title: 'إعادة تعيين كلمة المرور',
          description: 'أدخل البريد الإلكتروني المرتبط بحسابك الذي تريد تغيير كلمة المرور له، ثم أنشئ كلمة مرور جديدة قوية.',
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
          description: 'Enter the email associated with your account that you want to reset the password for, then create a new strong password.',
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
