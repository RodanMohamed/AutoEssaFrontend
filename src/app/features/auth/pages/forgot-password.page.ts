import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../data-access/auth.service';
import { AUTH_EMAIL_REGEX, AUTH_STRONG_PASSWORD_REGEX } from '../utils/auth.constants';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, MatInputModule, MatButtonModule],
  template: `
    <h2 class="mb-4 text-center text-2xl font-semibold">Reset Password</h2>
    <p class="mb-4 text-center text-sm text-base-content/80">
      Enter your email and create a new strong password.
    </p>

    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email" />
        @if (form.controls.email.hasError('required')) {
          <mat-error>Email is required.</mat-error>
        }
        @if (form.controls.email.hasError('email') || form.controls.email.hasError('pattern')) {
          <mat-error>Please enter a valid email format.</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>New password</mat-label>
        <input matInput formControlName="newPassword" type="password" />
        @if (form.controls.newPassword.hasError('required')) {
          <mat-error>New password is required.</mat-error>
        }
        @if (form.controls.newPassword.hasError('pattern')) {
          <mat-error>Password must be at least 8 chars with upper, lower, number, and symbol.</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Confirm password</mat-label>
        <input matInput formControlName="confirmPassword" type="password" />
        @if (form.controls.confirmPassword.hasError('required')) {
          <mat-error>Confirm password is required.</mat-error>
        }
        @if (hasMismatch()) {
          <mat-error>Passwords do not match.</mat-error>
        }
      </mat-form-field>

      <button mat-flat-button color="primary" class="w-full" type="submit" [disabled]="isSubmitDisabled()">
        Set New Password
      </button>
    </form>

    @if (status()) {
      <p class="mt-3 text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">{{ status() }}</p>
    }

    <p class="mt-4 text-center text-sm">
      Back to <a routerLink="/auth/login" class="link link-primary">Login</a>
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ForgotPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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
