import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { LocaleService } from '../../../core/services/locale.service';

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
          <mat-label>{{ copy().usernameLabel }}</mat-label>
          <input matInput formControlName="username" type="text" />
          @if (form.controls.username.hasError('required')) {
            <mat-error>{{ copy().usernameRequired }}</mat-error>
          }
          @if (form.controls.username.hasError('pattern')) {
            <mat-error>{{ copy().usernamePattern }}</mat-error>
          }
        </mat-form-field>
      }

      @if (isRegisterMode()) {
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ copy().fullNameLabel }}</mat-label>
          <input matInput formControlName="fullName" type="text" />
          @if (form.controls.fullName.hasError('required')) {
            <mat-error>{{ copy().fullNameRequired }}</mat-error>
          }
        </mat-form-field>
      }

      @if (isRegisterMode()) {
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ copy().phoneLabel }}</mat-label>
          <input matInput formControlName="phoneNumber" type="text" placeholder="+2010xxxxxxx" />
          @if (form.controls.phoneNumber.hasError('required')) {
            <mat-error>{{ copy().phoneRequired }}</mat-error>
          }
          @if (form.controls.phoneNumber.hasError('pattern')) {
            <mat-error>{{ copy().phonePattern }}</mat-error>
          }
        </mat-form-field>
      }

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
        <mat-label>{{ copy().passwordLabel }}</mat-label>
        <input matInput formControlName="password" type="password" />
        @if (form.controls.password.hasError('required')) {
          <mat-error>{{ copy().passwordRequired }}</mat-error>
        }
        @if (form.controls.password.hasError('pattern')) {
          <mat-error>{{ copy().passwordPattern }}</mat-error>
        }
      </mat-form-field>

      @if (isRegisterMode()) {
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ copy().confirmPasswordLabel }}</mat-label>
          <input matInput formControlName="confirmPassword" type="password" />
          @if (form.controls.confirmPassword.hasError('required')) {
            <mat-error>{{ copy().confirmPasswordRequired }}</mat-error>
          }
          @if (hasPasswordMismatch()) {
            <mat-error>{{ copy().passwordMismatch }}</mat-error>
          }
        </mat-form-field>
      }

      <button mat-flat-button color="primary" class="w-full" type="submit">
        {{ submitLabel() }}
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthFormComponent {
  private readonly localeService = inject(LocaleService);

  mode = input.required<AuthFormMode>();
  readonly submitted = output<AuthFormValue>();

  protected readonly copy = computed(() =>
    this.localeService.locale() === 'ar'
      ? {
          usernameLabel: 'اسم المستخدم',
          usernameRequired: 'اسم المستخدم مطلوب.',
          usernamePattern: 'يجب أن يحتوي اسم المستخدم على حروف أو شرطة سفلية فقط بدون أرقام.',
          fullNameLabel: 'الاسم الكامل',
          fullNameRequired: 'الاسم الكامل مطلوب.',
          phoneLabel: 'رقم الهاتف',
          phoneRequired: 'رقم الهاتف مطلوب.',
          phonePattern: 'يرجى إدخال رقم هاتف مصري صحيح.',
          emailLabel: 'البريد الإلكتروني',
          emailRequired: 'البريد الإلكتروني مطلوب.',
          emailPattern: 'يرجى إدخال صيغة بريد إلكتروني صحيحة.',
          passwordLabel: 'كلمة المرور',
          passwordRequired: 'كلمة المرور مطلوبة.',
          passwordPattern: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم ورمز.',
          confirmPasswordLabel: 'تأكيد كلمة المرور',
          confirmPasswordRequired: 'تأكيد كلمة المرور مطلوب.',
          passwordMismatch: 'كلمتا المرور غير متطابقتين.',
          login: 'تسجيل الدخول',
          register: 'إنشاء حساب'
        }
      : {
          usernameLabel: 'Username',
          usernameRequired: 'Username is required.',
          usernamePattern: 'Username must contain letters or underscore only, no numbers.',
          fullNameLabel: 'Full name',
          fullNameRequired: 'Full name is required.',
          phoneLabel: 'Phone number',
          phoneRequired: 'Phone number is required.',
          phonePattern: 'Please enter a valid Egyptian phone format.',
          emailLabel: 'Email',
          emailRequired: 'Email is required.',
          emailPattern: 'Please enter a valid email format.',
          passwordLabel: 'Password',
          passwordRequired: 'Password is required.',
          passwordPattern: 'Password must be at least 8 chars with upper, lower, number, and symbol.',
          confirmPasswordLabel: 'Confirm password',
          confirmPasswordRequired: 'Confirm password is required.',
          passwordMismatch: 'Passwords do not match.',
          login: 'Login',
          register: 'Register'
        }
  );

  protected readonly submitLabel = computed(() => (this.mode() === 'register' ? this.copy().register : this.copy().login));
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

  private isLoginFormValid(): boolean {
    return this.form.controls.email.valid && this.form.controls.password.valid;
  }

  private isRegisterFormValid(): boolean {
    return this.form.valid && !this.hasPasswordMismatch();
  }

  protected submit() {
    const isValid = this.mode() === 'register' ? this.isRegisterFormValid() : this.isLoginFormValid();

    if (!isValid) {
      this.form.markAllAsTouched();
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
