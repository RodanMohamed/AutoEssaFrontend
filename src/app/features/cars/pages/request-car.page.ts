import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { CreateCarRequestLeadPayload } from '../../../core/interfaces/autoessa-endpoints.interface';
import { LocaleService } from '../../../core/services/locale.service';
import { AuthStore } from '../../auth/data-access/auth.store';
import { UserService } from '../../user/data-access/user.service';
import { extractApiErrorMessage } from '../../auth/utils/auth.helpers';
import { egyptianPhoneValidator, minYearValidator } from '../../../shared/validators/custom.validators';

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
              <input class="input input-bordered w-full" formControlName="phoneNumber" type="text" />
              @if (isInvalid('phoneNumber')) {
                <p class="mt-1 text-xs text-error">{{ getPhoneErrorMessage() }}</p>
              }
            </div>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().brandLabel }}</span>
            <div class="flex-1">
              <input class="input input-bordered w-full" formControlName="desiredBrand" type="text" />
              @if (isInvalid('desiredBrand')) {
                <p class="mt-1 text-xs text-error">{{ copy().requiredError }}</p>
              }
            </div>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().modelLabel }}</span>
            <div class="flex-1">
              <input class="input input-bordered w-full" formControlName="desiredModel" type="text" />
              @if (isInvalid('desiredModel')) {
                <p class="mt-1 text-xs text-error">{{ copy().requiredError }}</p>
              }
            </div>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().yearFromLabel }}</span>
            <div class="flex-1">
              <input class="input input-bordered w-full" formControlName="desiredYearFrom" type="number" min="1990" />
              @if (isInvalid('desiredYearFrom')) {
                @if (form.get('desiredYearFrom')?.errors?.['min'] || form.get('desiredYearFrom')?.errors?.['yearTooSmall']) {
                  <p class="mt-1 text-xs text-error">Year must be 1990 or later</p>
                } @else {
                  <p class="mt-1 text-xs text-error">{{ copy().yearError }}</p>
                }
              }
            </div>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().yearToLabel }}</span>
            <div class="flex-1">
              <input class="input input-bordered w-full" formControlName="desiredYearTo" type="number" min="1990" />
              @if (isInvalid('desiredYearTo')) {
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
            <textarea class="textarea textarea-bordered flex-1" formControlName="notes" rows="4"></textarea>
          </label>

          <div>
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid">{{ copy().submitButton }}</button>
          </div>

          @if (status()) {
            <p class="text-sm font-medium" [class.text-success]="!isError()" [class.text-error]="isError()">
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
          yearError: 'أدخل سنة صالحة.',
          budgetError: 'أدخل ميزانية صالحة.',
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
          yearError: 'Enter a valid year.',
          budgetError: 'Enter a valid budget.',
          submitButton: 'Submit Car Request'
        }
  );

  protected readonly form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    phoneNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, egyptianPhoneValidator()] }),
    desiredBrand: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    desiredModel: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    desiredYearFrom: new FormControl<number | null>(null, [Validators.min(1990)]),
    desiredYearTo: new FormControl<number | null>(null, [Validators.min(1990)]),
    budget: new FormControl<number | null>(null, [Validators.min(1)]),
    notes: new FormControl('', { nonNullable: true })
  });

  protected isInvalid(controlName: 'fullName' | 'phoneNumber' | 'desiredBrand' | 'desiredModel' | 'desiredYearFrom' | 'desiredYearTo' | 'budget') {
    const control = this.form.controls[controlName];
    return control.invalid;
  }

  protected getPhoneErrorMessage(): string {
    const phoneControl = this.form.get('phoneNumber');
    if (!phoneControl) return '';

    if (phoneControl.errors?.['required']) {
      return this.copy().requiredError;
    }
    if (phoneControl.errors?.['invalidEgyptianPhone']) {
      return 'Phone must be a valid egyption number ';
    }
    return '';
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
        fullName: value.fullName,
        phoneNumber: value.phoneNumber,
        desiredBrand: value.desiredBrand,
        desiredModel: value.desiredModel,
        ...(sessionUserId && sessionUserId !== '0' && sessionUserId !== 'local-user' ? { userId: sessionUserId } : {}),
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
