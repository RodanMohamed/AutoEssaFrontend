import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { LocaleService } from '../../../core/services/locale.service';

import {
  AUTH_EMAIL_VALIDATORS,
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
    <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
      @if (isRegisterMode()) {
        <mat-form-field appearance="outline" class="auth-field w-full">
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
        <mat-form-field appearance="outline" class="auth-field w-full">
          <mat-label>{{ copy().fullNameLabel }}</mat-label>
          <input matInput formControlName="fullName" type="text" />
          @if (form.controls.fullName.hasError('required')) {
            <mat-error>{{ copy().fullNameRequired }}</mat-error>
          }
        </mat-form-field>
      }

      @if (isRegisterMode()) {
        <mat-form-field appearance="outline" class="auth-field w-full">
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
        <mat-form-field appearance="outline" class="auth-field w-full">
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

      <button mat-flat-button color="primary" class="auth-submit w-full" type="submit" [disabled]="isSubmitDisabled()">
        {{ submitLabel() }}
      </button>
    </form>
  `,
  styles: `
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthFormComponent {
  private readonly localeService = inject(LocaleService);

  mode = input.required<AuthFormMode>();
  readonly submitted = output<AuthFormValue>();

  constructor() {
    effect(() => {
      this.applyModeValidators(this.mode());
    });
  }

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

  private applyModeValidators(mode: AuthFormMode) {
    const usernameControl = this.form.controls.username;
    const fullNameControl = this.form.controls.fullName;
    const phoneControl = this.form.controls.phoneNumber;
    const emailControl = this.form.controls.email;
    const passwordControl = this.form.controls.password;
    const confirmPasswordControl = this.form.controls.confirmPassword;

    if (mode === 'register') {
      usernameControl.enable({ emitEvent: false });
      fullNameControl.enable({ emitEvent: false });
      phoneControl.enable({ emitEvent: false });
      confirmPasswordControl.enable({ emitEvent: false });

      usernameControl.setValidators(AUTH_USERNAME_VALIDATORS);
      fullNameControl.setValidators([Validators.required]);
      phoneControl.setValidators(AUTH_PHONE_VALIDATORS);
      emailControl.setValidators(AUTH_EMAIL_STRICT_VALIDATORS);
      passwordControl.setValidators(AUTH_PASSWORD_VALIDATORS);
      confirmPasswordControl.setValidators([Validators.required]);
    } else {
      usernameControl.disable({ emitEvent: false });
      fullNameControl.disable({ emitEvent: false });
      phoneControl.disable({ emitEvent: false });
      confirmPasswordControl.disable({ emitEvent: false });

      emailControl.setValidators(AUTH_EMAIL_VALIDATORS);
      passwordControl.setValidators([Validators.required]);
    }

    usernameControl.updateValueAndValidity({ emitEvent: false });
    fullNameControl.updateValueAndValidity({ emitEvent: false });
    phoneControl.updateValueAndValidity({ emitEvent: false });
    emailControl.updateValueAndValidity({ emitEvent: false });
    passwordControl.updateValueAndValidity({ emitEvent: false });
    confirmPasswordControl.updateValueAndValidity({ emitEvent: false });
  }
}
