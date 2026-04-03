import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import {
  AUTH_EMAIL_STRICT_VALIDATORS,
  AUTH_PASSWORD_VALIDATORS,
  AUTH_PHONE_VALIDATORS,
  AUTH_USERNAME_VALIDATORS
} from '../utils/auth.validators';

export type AuthFormMode = 'login' | 'register';

export interface AuthFormValue {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-auth-form',
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      @if (isRegisterMode()) {
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" type="text" />
          @if (form.controls.username.hasError('required')) {
            <mat-error>Username is required.</mat-error>
          }
          @if (form.controls.username.hasError('pattern')) {
            <mat-error>Username must contain letters or underscore only, no numbers.</mat-error>
          }
        </mat-form-field>
      }

      @if (isRegisterMode()) {
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Full name</mat-label>
          <input matInput formControlName="fullName" type="text" />
          @if (form.controls.fullName.hasError('required')) {
            <mat-error>Full name is required.</mat-error>
          }
        </mat-form-field>
      }

      @if (isRegisterMode()) {
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Phone number</mat-label>
          <input matInput formControlName="phoneNumber" type="text" placeholder="+2010xxxxxxx" />
          @if (form.controls.phoneNumber.hasError('required')) {
            <mat-error>Phone number is required.</mat-error>
          }
          @if (form.controls.phoneNumber.hasError('pattern')) {
            <mat-error>Please enter a valid Egyptian phone format.</mat-error>
          }
        </mat-form-field>
      }

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
        <mat-label>Password</mat-label>
        <input matInput formControlName="password" type="password" />
        @if (form.controls.password.hasError('required')) {
          <mat-error>Password is required.</mat-error>
        }
        @if (form.controls.password.hasError('pattern')) {
          <mat-error>Password must be at least 8 chars with upper, lower, number, and symbol.</mat-error>
        }
      </mat-form-field>

      @if (isRegisterMode()) {
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Confirm password</mat-label>
          <input matInput formControlName="confirmPassword" type="password" />
          @if (form.controls.confirmPassword.hasError('required')) {
            <mat-error>Confirm password is required.</mat-error>
          }
          @if (hasPasswordMismatch()) {
            <mat-error>Passwords do not match.</mat-error>
          }
        </mat-form-field>
      }

      <button mat-flat-button color="primary" class="w-full" type="submit" [disabled]="isSubmitDisabled()">
        {{ submitLabel() }}
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthFormComponent {
  mode = input.required<AuthFormMode>();
  readonly submitted = output<AuthFormValue>();

  protected readonly submitLabel = computed(() => (this.mode() === 'register' ? 'Register' : 'Login'));
  protected readonly isRegisterMode = computed(() => this.mode() === 'register');
  protected readonly hasPasswordMismatch = computed(() => {
    if (this.mode() !== 'register') {
      return false;
    }

    const password = this.form.controls.password.value;
    const confirmPassword = this.form.controls.confirmPassword.value;
    if (confirmPassword.length === 0) {
      return false;
    }

    return password !== confirmPassword;
  });

  protected readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: AUTH_USERNAME_VALIDATORS }),
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phoneNumber: new FormControl('', { nonNullable: true, validators: AUTH_PHONE_VALIDATORS }),
    email: new FormControl('', { nonNullable: true, validators: AUTH_EMAIL_STRICT_VALIDATORS }),
    password: new FormControl('', { nonNullable: true, validators: AUTH_PASSWORD_VALIDATORS }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  protected readonly isSubmitDisabled = computed(() => {
    const currentMode = this.mode();

    if (currentMode === 'register') {
      return this.form.invalid || this.hasPasswordMismatch();
    }

    return this.form.controls.email.invalid || this.form.controls.password.invalid;
  });

  protected submit() {
    if (this.isSubmitDisabled()) {
      return;
    }

    const value = this.form.getRawValue();
    this.submitted.emit({
      username: value.username,
      fullName: value.fullName,
      email: value.email,
      phoneNumber: value.phoneNumber,
      password: value.password,
      confirmPassword: value.confirmPassword
    });
  }
}
