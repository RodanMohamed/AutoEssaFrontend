import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { CreateCarRequestLeadPayload } from '../../../core/interfaces/autoessa-endpoints.interface';
import { LocaleService } from '../../../core/services/locale.service';
import { AuthStore } from '../../auth/data-access/auth.store';
import { UserService } from '../../user/data-access/user.service';
import { extractApiErrorMessage } from '../../auth/utils/auth.helpers';

const CURRENT_YEAR = new Date().getFullYear();

//////////////////////////////////////////////////////////
// Validators
//////////////////////////////////////////////////////////

// Prevent whitespace-only input
const noWhitespaceValidator: ValidatorFn = (control: AbstractControl) => {
  if (typeof control.value === 'string') {
    const trimmed = control.value.trim();
    if (trimmed.length === 0) {
      return { whitespace: true };
    }
  }
  return null;
};

// Validate year range
const yearRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const group = control as FormGroup;

  const yearFrom = group.controls['desiredYearFrom']?.value;
  const yearTo = group.controls['desiredYearTo']?.value;

  if (typeof yearFrom !== 'number' || typeof yearTo !== 'number') {
    return null;
  }

  return yearFrom <= yearTo
    ? null
    : { invalidYearRange: true };
};

@Component({
  selector: 'app-request-car-page',
  imports: [ReactiveFormsModule],
  template: `
<section class="mx-auto max-w-4xl space-y-6">

<h1 class="font-serif text-3xl">
{{ copy().title }}
</h1>

<p class="text-base-content/75">
{{ copy().description }}
</p>

<form
  [formGroup]="form"
  (ngSubmit)="submit()"
  class="card border border-base-300 bg-base-100 shadow"
>

<div class="card-body space-y-4">

<!-- Full Name -->

<label class="flex items-center gap-3">

<span class="label-text min-w-32">
{{ copy().fullNameLabel }}
</span>

<div class="flex-1">

<input
  class="input input-bordered w-full"
  formControlName="fullName"
  type="text"
  maxlength="100"
/>

@if (isInvalid('fullName')) {

<p class="mt-1 text-xs text-error">
{{ copy().requiredError }}
</p>

}

</div>

</label>

<!-- Phone -->

<label class="flex items-center gap-3">

<span class="label-text min-w-32">
{{ copy().phoneLabel }}
</span>

<div class="flex-1">

<input
  class="input input-bordered w-full"
  formControlName="phoneNumber"
  type="text"
  inputmode="tel"
  maxlength="30"
/>

@if (isRequiredInvalid('phoneNumber')) {

<p class="mt-1 text-xs text-error">
{{ copy().requiredError }}
</p>

}


</div>

</label>

<!-- Brand -->

<label class="flex items-center gap-3">

<span class="label-text min-w-32">
{{ copy().brandLabel }}
</span>

<div class="flex-1">

<input
  class="input input-bordered w-full"
  formControlName="desiredBrand"
  type="text"
  maxlength="100"
/>

@if (isInvalid('desiredBrand')) {

<p class="mt-1 text-xs text-error">
{{ copy().requiredError }}
</p>

}

</div>

</label>

<!-- Model -->

<label class="flex items-center gap-3">

<span class="label-text min-w-32">
{{ copy().modelLabel }}
</span>

<div class="flex-1">

<input
  class="input input-bordered w-full"
  formControlName="desiredModel"
  type="text"
  maxlength="100"
/>

@if (isInvalid('desiredModel')) {

<p class="mt-1 text-xs text-error">
{{ copy().requiredError }}
</p>

}

</div>

</label>

<!-- Year From -->

<label class="flex items-center gap-3">

<span class="label-text min-w-32">
{{ copy().yearFromLabel }}
</span>

<div class="flex-1">

<input
  class="input input-bordered w-full"
  formControlName="desiredYearFrom"
  type="number"
  min="1990"
  [max]="maxYear"
/>

@if (isInvalid('desiredYearFrom') || isYearRangeInvalid()) {

<p class="mt-1 text-xs text-error">
{{ copy().yearError }}
</p>

}

</div>

</label>

<!-- Year To -->

<label class="flex items-center gap-3">

<span class="label-text min-w-32">
{{ copy().yearToLabel }}
</span>

<div class="flex-1">

<input
  class="input input-bordered w-full"
  formControlName="desiredYearTo"
  type="number"
  min="1990"
  [max]="maxYear"
/>

@if (isInvalid('desiredYearTo') || isYearRangeInvalid()) {

<p class="mt-1 text-xs text-error">
{{ copy().yearError }}
</p>

}

</div>

</label>

<!-- Budget -->

<label class="flex items-center gap-3">

<span class="label-text min-w-32">
{{ copy().budgetLabel }}
</span>

<div class="flex-1">

<input
  class="input input-bordered w-full"
  formControlName="budget"
  type="number"
/>

@if (isInvalid('budget')) {

<p class="mt-1 text-xs text-error">
{{ copy().budgetError }}
</p>

}

</div>

</label>

<!-- Notes -->

<label class="flex items-start gap-3">

<span class="label-text min-w-32 mt-2">
{{ copy().notesLabel }}
</span>

<div class="flex-1">

<textarea
  class="textarea textarea-bordered w-full"
  formControlName="notes"
  rows="4"
  maxlength="1000"
></textarea>

</div>

</label>

<button
  class="btn btn-primary"
  type="submit"
  [disabled]="form.invalid"
>

{{ copy().submitButton }}

</button>

@if (status()) {

<p
  class="text-sm"
  [class.text-success]="!isError()"
  [class.text-error]="isError()"
>

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

//////////////////////////////////////////////////////////
// Inject services
//////////////////////////////////////////////////////////

private readonly api = inject(AutoessaApiService);
private readonly localeService = inject(LocaleService);
private readonly authStore = inject(AuthStore);
private readonly userService = inject(UserService);

//////////////////////////////////////////////////////////

protected readonly status = signal('');
protected readonly isError = signal(false);

//////////////////////////////////////////////////////////

protected readonly maxYear = CURRENT_YEAR;

//////////////////////////////////////////////////////////
// FORM
//////////////////////////////////////////////////////////

protected readonly form = new FormGroup(
{
  fullName: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.maxLength(100),
      noWhitespaceValidator
    ]
  }),

  phoneNumber: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.maxLength(30),
      noWhitespaceValidator
    ]
  }),

  desiredBrand: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.maxLength(100),
      noWhitespaceValidator
    ]
  }),

  desiredModel: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.maxLength(100),
      noWhitespaceValidator
    ]
  }),

  desiredYearFrom: new FormControl<number | null>(
    null,
    [
      Validators.min(1990),
      Validators.max(CURRENT_YEAR)
    ]
  ),

  desiredYearTo: new FormControl<number | null>(
    null,
    [
      Validators.min(1990),
      Validators.max(CURRENT_YEAR)
    ]
  ),

  budget: new FormControl<number | null>(
    null,
    [
      Validators.min(1),
      Validators.max(100_000_000)
    ]
  ),

  notes: new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(1000)]
  })

},
{
  validators: [yearRangeValidator]
});

//////////////////////////////////////////////////////////
// Validation helpers
//////////////////////////////////////////////////////////

protected isInvalid(controlName: keyof typeof this.form.controls) {

const control = this.form.controls[controlName];

return control.touched && control.invalid;

}

protected isRequiredInvalid(controlName: keyof typeof this.form.controls) {

const control = this.form.controls[controlName];

return control.touched && control.hasError('required');

}

protected isYearRangeInvalid() {

return (
this.form.touched &&
this.form.hasError('invalidYearRange')
);

}

//////////////////////////////////////////////////////////
// SUBMIT
//////////////////////////////////////////////////////////

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

const sessionUserId =
this.authStore.session()?.user.id;

// DEBUG: Log form values before trimming
console.log('📋 Form raw values:', value);

const payload: CreateCarRequestLeadPayload = {

fullName: value.fullName.trim(),
phoneNumber: value.phoneNumber.trim(),
desiredBrand: value.desiredBrand.trim(),
desiredModel: value.desiredModel.trim(),

...(sessionUserId
? { userId: sessionUserId }
: {}),

...(typeof value.desiredYearFrom === 'number'
? { desiredYearFrom: value.desiredYearFrom }
: {}),

...(typeof value.desiredYearTo === 'number'
? { desiredYearTo: value.desiredYearTo }
: {}),

...(typeof value.budget === 'number'
? { budget: value.budget }
: {}),

...(value.notes.trim().length > 0
? { notes: value.notes.trim() }
: {})

};

// DEBUG (important)
console.log(' Form Payload prepared:', JSON.stringify(payload, null, 2));
console.log(' fullName value:', payload.fullName, '| length:', payload.fullName.length);

this.api
.createCarLeadRequest(payload)
.subscribe({

next: () => {

this.userService.rememberPendingCarRequest(
sessionUserId,
payload
);

this.status.set(
this.localeService.locale() === 'ar'
? 'تم إرسال الطلب بنجاح.'
: 'Car request submitted successfully.'
);

this.form.reset();

},

error: (error: unknown) => {

this.isError.set(true);

// Enhanced error logging
console.error( 'API Error Response:', error);
if (error instanceof Object && 'error' in error) {
  console.error(' Backend Error Details:', (error as any).error);
}

const errorMsg = extractApiErrorMessage(
  error,
  'Unable to submit request right now.'
);

console.error(' Extracted Error Message:', errorMsg);

this.status.set(errorMsg);

}

});

}

//////////////////////////////////////////////////////////
// Copy text
//////////////////////////////////////////////////////////

protected readonly copy = computed(() =>

this.localeService.locale() === 'ar'

? {

title: 'اطلب سيارة',

description:
'لم تجد السيارة المناسبة؟ أرسل طلبك وسيبحث فريقنا عن أفضل خيار.',

fullNameLabel: 'الاسم الكامل',

phoneLabel: 'رقم الهاتف',

brandLabel: 'العلامة المطلوبة',

modelLabel: 'الموديل المطلوب',

yearFromLabel: 'السنة من',

yearToLabel: 'السنة إلى',

budgetLabel: 'الميزانية',

notesLabel: 'ملاحظات',

requiredError: 'هذا الحقل مطلوب.',

phoneError: 'رقم الهاتف غير صحيح.',

yearError: 'نطاق السنة غير صحيح.',

budgetError: 'ميزانية غير صحيحة.',

notesError: 'الحد الأقصى للملاحظات هو 1000 حرف.',

submitButton: 'إرسال الطلب'

}

: {

title: 'Request A Car',

description:
'Send your request and we will find the best option.',

fullNameLabel: 'Full Name',

phoneLabel: 'Phone Number',

brandLabel: 'Desired Brand',

modelLabel: 'Desired Model',

yearFromLabel: 'Year From',

yearToLabel: 'Year To',

budgetLabel: 'Budget',

notesLabel: 'Notes',

requiredError: 'This field is required.',

phoneError: 'Invalid phone number.',

yearError: 'Invalid year range.',

budgetError: 'Invalid budget.',

notesError: 'Notes can be up to 1000 characters only.',

submitButton: 'Submit Request'

}

);

}
