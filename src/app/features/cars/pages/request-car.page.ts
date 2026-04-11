import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { CreateCarRequestLeadPayload } from '../../../core/interfaces/autoessa-endpoints.interface';
import { LocaleService } from '../../../core/services/locale.service';
import { AuthStore } from '../../auth/data-access/auth.store';
import { UserService } from '../../user/data-access/user.service';
import { extractApiErrorMessage } from '../../auth/utils/auth.helpers';

const CURRENT_YEAR = new Date().getFullYear();
const EGYPT_MOBILE_PHONE_REGEX = /^01[0125]\d{8}$/;

const yearRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const group = control as FormGroup;
  const yearFrom = group.controls['desiredYearFrom']?.value as number | null | undefined;
  const yearTo = group.controls['desiredYearTo']?.value as number | null | undefined;

  if (typeof yearFrom !== 'number' || typeof yearTo !== 'number') {
    return null;
  }

  return yearFrom <= yearTo ? null : { invalidYearRange: true };
};

@Component({
  selector: 'app-request-car-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="mx-auto max-w-4xl space-y-6">
      <h1 class="font-serif text-3xl">{{ copy().title }}</h1>
      <p class="text-base-content/75">{{ copy().description }}</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body space-y-4">
          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().fullNameLabel }}</span>
            <div class="flex-1">
              <input class="input input-bordered w-full" formControlName="fullName" type="text" />
              @if (isInvalid('fullName')) {
                <p class="mt-1 text-xs text-error">{{ copy().requiredError }}</p>
              }
            </div>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().phoneLabel }}</span>
            <div class="flex-1">
              <input class="input input-bordered w-full" formControlName="phoneNumber" type="text" inputmode="tel" maxlength="13" />
              @if (isRequiredInvalid('phoneNumber')) {
                <p class="mt-1 text-xs text-error">{{ copy().requiredError }}</p>
              } @else if (isPhoneInvalid()) {
                <p class="mt-1 text-xs text-error">{{ copy().phoneError }}</p>
              }
            </div>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().brandLabel }}</span>
            <div class="flex-1">
              <input class="input input-bordered w-full" formControlName="desiredBrand" type="text" maxlength="40" />
              @if (isInvalid('desiredBrand')) {
                <p class="mt-1 text-xs text-error">{{ copy().requiredError }}</p>
              }
            </div>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().modelLabel }}</span>
            <div class="flex-1">
              <input class="input input-bordered w-full" formControlName="desiredModel" type="text" maxlength="40" />
              @if (isInvalid('desiredModel')) {
                <p class="mt-1 text-xs text-error">{{ copy().requiredError }}</p>
              }
            </div>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().yearFromLabel }}</span>
            <div class="flex-1">
              <input class="input input-bordered w-full" formControlName="desiredYearFrom" type="number" min="1990" [max]="maxYear" />
              @if (isInvalid('desiredYearFrom') || isYearRangeInvalid()) {
                <p class="mt-1 text-xs text-error">{{ copy().yearError }}</p>
              }
            </div>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().yearToLabel }}</span>
            <div class="flex-1">
              <input class="input input-bordered w-full" formControlName="desiredYearTo" type="number" min="1990" [max]="maxYear" />
              @if (isInvalid('desiredYearTo') || isYearRangeInvalid()) {
                <p class="mt-1 text-xs text-error">{{ copy().yearError }}</p>
              }
            </div>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().budgetLabel }}</span>
            <div class="flex-1">
              <input class="input input-bordered w-full" formControlName="budget" type="number" min="1" />
              @if (isInvalid('budget')) {
                <p class="mt-1 text-xs text-error">{{ copy().budgetError }}</p>
              }
            </div>
          </label>

          <label class="flex items-start gap-3">
            <span class="label-text min-w-32 mt-2">{{ copy().notesLabel }}</span>
            <div class="flex-1">
              <textarea class="textarea textarea-bordered w-full" formControlName="notes" rows="4" maxlength="500"></textarea>
              @if (isInvalid('notes')) {
                <p class="mt-1 text-xs text-error">{{ copy().notesError }}</p>
              }
            </div>
          </label>

          <div>
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid">{{ copy().submitButton }}</button>
          </div>

          @if (status()) {
            <p class="text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">
              {{ status() }}
            </p>
          }
        </div>
      </form>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class RequestCarPage {
  private readonly api = inject(AutoessaApiService);
  private readonly localeService = inject(LocaleService);
  private readonly authStore = inject(AuthStore);
  private readonly userService = inject(UserService);

  protected readonly status = signal('');
  protected readonly isError = signal(false);
  protected readonly copy = computed(() =>
    this.localeService.locale() === 'ar'
      ? {
          title: 'اطلب سيارة',
          description: 'لم تجد السيارة المناسبة؟ أرسل طلبك وسيبحث فريقنا عن أفضل خيار مطابق.',
          fullNameLabel: 'الاسم الكامل',
          phoneLabel: 'رقم الهاتف',
          brandLabel: 'العلامة المطلوبة',
          modelLabel: 'الموديل المطلوب',
          yearFromLabel: 'السنة من',
          yearToLabel: 'السنة إلى',
          budgetLabel: 'الميزانية (جنيه مصري)',
          notesLabel: 'ملاحظات',
          requiredError: 'هذا الحقل مطلوب.',
          phoneError: 'أدخل رقم موبايل مصري صحيح.',
          yearError: 'أدخل سنة صالحة وتأكد أن سنة البداية أقل من أو تساوي سنة النهاية.',
          budgetError: 'أدخل ميزانية صالحة.',
          notesError: 'الملاحظات يجب ألا تتجاوز 500 حرف.',
          submitButton: 'إرسال طلب السيارة'
        }
      : {
          title: 'Request A Car',
          description: 'Did not find your target car? Send your request and our team will source the best matching option.',
          fullNameLabel: 'Full Name',
          phoneLabel: 'Phone Number',
          brandLabel: 'Desired Brand',
          modelLabel: 'Desired Model',
          yearFromLabel: 'Year From',
          yearToLabel: 'Year To',
          budgetLabel: 'Budget (EGP)',
          notesLabel: 'Notes',
          requiredError: 'This field is required.',
          phoneError: 'Enter a valid Egyptian mobile number.',
          yearError: 'Enter a valid year and ensure Year From is less than or equal to Year To.',
          budgetError: 'Enter a valid budget.',
          notesError: 'Notes must not exceed 500 characters.',
          submitButton: 'Submit Car Request'
        }
  );

  protected readonly maxYear = CURRENT_YEAR;

  protected readonly form = new FormGroup(
    {
      fullName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      phoneNumber: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(EGYPT_MOBILE_PHONE_REGEX)]
      }),
      desiredBrand: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(40)]
      }),
      desiredModel: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(40)]
      }),
      desiredYearFrom: new FormControl<number | null>(null, [Validators.min(1990), Validators.max(CURRENT_YEAR)]),
      desiredYearTo: new FormControl<number | null>(null, [Validators.min(1990), Validators.max(CURRENT_YEAR)]),
      budget: new FormControl<number | null>(null, [Validators.min(1), Validators.max(100_000_000)]),
      notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] })
    },
    { validators: [yearRangeValidator] }
  );

  protected isInvalid(controlName: 'fullName' | 'phoneNumber' | 'desiredBrand' | 'desiredModel' | 'desiredYearFrom' | 'desiredYearTo' | 'budget' | 'notes') {
    const control = this.form.controls[controlName];
    return control.touched && control.invalid;
  }

  protected isRequiredInvalid(controlName: 'fullName' | 'phoneNumber' | 'desiredBrand' | 'desiredModel') {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError('required');
  }

  protected isPhoneInvalid() {
    const control = this.form.controls.phoneNumber;
    return control.touched && !control.hasError('required') && control.hasError('pattern');
  }

  protected isYearRangeInvalid() {
    return this.form.touched && this.form.hasError('invalidYearRange');
  }

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.isError.set(true);
      this.status.set(this.copy().requiredError);
      return;
    }

    this.status.set('');
    this.isError.set(false);

    const value = this.form.getRawValue();
    const sessionUserId = this.authStore.session()?.user.id;
    const payload: CreateCarRequestLeadPayload = {
      fullName: value.fullName.trim(),
      phoneNumber: value.phoneNumber.trim(),
      desiredBrand: value.desiredBrand.trim(),
      desiredModel: value.desiredModel.trim(),
        ...(sessionUserId && sessionUserId.trim().length > 0 ? { userId: sessionUserId } : {}),
        ...(typeof value.desiredYearFrom === 'number' ? { desiredYearFrom: value.desiredYearFrom } : {}),
        ...(typeof value.desiredYearTo === 'number' ? { desiredYearTo: value.desiredYearTo } : {}),
        ...(typeof value.budget === 'number' ? { budget: value.budget } : {}),
        ...(value.notes.trim().length > 0 ? { notes: value.notes.trim() } : {})
      };

    this.api
      .createCarLeadRequest(payload)
      .subscribe({
        next: () => {
          this.userService.rememberPendingCarRequest(sessionUserId, payload);
          this.status.set('Car request submitted successfully. It will appear in My Requests.');
          this.form.reset({
            fullName: '',
            phoneNumber: '',
            desiredBrand: '',
            desiredModel: '',
            desiredYearFrom: null,
            desiredYearTo: null,
            budget: null,
            notes: ''
          });
        },
        error: (error: unknown) => {
          this.isError.set(true);
          this.status.set(extractApiErrorMessage(error, 'Unable to submit request right now. Please try again later.'));
        }
      });
  }
}
