import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { LocaleService } from '../../../core/services/locale.service';

@Component({
  selector: 'app-request-car-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="mx-auto max-w-4xl space-y-6">
      <h1 class="font-serif text-3xl">{{ copy().title }}</h1>
      <p class="text-base-content/75">{{ copy().description }}</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body grid gap-4 md:grid-cols-2">
          <label class="form-control">
            <span class="label-text">{{ copy().fullNameLabel }}</span>
            <input class="input input-bordered ml-2" formControlName="fullName" type="text" />
          </label>

          <label class="form-control">
            <span class="label-text">{{ copy().phoneLabel }}</span>
            <input class="input input-bordered ml-2" formControlName="phoneNumber" type="text" />
          </label>

          <label class="form-control">
            <span class="label-text">{{ copy().brandLabel }}</span>
            <input class="input input-bordered ml-2" formControlName="desiredBrand" type="text" />
          </label>

          <label class="form-control">
            <span class="label-text">{{ copy().modelLabel }}</span>
            <input class="input input-bordered ml-2" formControlName="desiredModel" type="text" />
          </label>

          <label class="form-control">
            <span class="label-text">{{ copy().yearFromLabel }}</span>
            <input class="input input-bordered ml-2" formControlName="desiredYearFrom" type="number" />
          </label>

          <label class="form-control">
            <span class="label-text">{{ copy().yearToLabel }}</span>
            <input class="input input-bordered ml-2" formControlName="desiredYearTo" type="number" />
          </label>

          <label class="form-control md:col-span-2">
            <span class="label-text">{{ copy().budgetLabel }}</span>
            <input class="input input-bordered ml-2" formControlName="budget" type="number" />
          </label>

          <label class="form-control md:col-span-2">
            <span class="label-text">{{ copy().notesLabel }}</span>
            <textarea class="textarea textarea-bordered ml-2" formControlName="notes" rows="4"></textarea>
          </label>

          <div class="md:col-span-2">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid">{{ copy().submitButton }}</button>
          </div>

          @if (status()) {
            <p class="md:col-span-2 text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">
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
          submitButton: 'Submit Car Request'
        }
  );

  protected readonly form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phoneNumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    desiredBrand: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    desiredModel: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    desiredYearFrom: new FormControl<number | null>(null),
    desiredYearTo: new FormControl<number | null>(null),
    budget: new FormControl<number | null>(null),
    notes: new FormControl('', { nonNullable: true })
  });

  protected submit() {
    if (this.form.invalid) {
      return;
    }

    this.status.set('');
    this.isError.set(false);

    const value = this.form.getRawValue();
    this.api
      .createCarLeadRequest({
        fullName: value.fullName,
        phoneNumber: value.phoneNumber,
        desiredBrand: value.desiredBrand,
        desiredModel: value.desiredModel,
        desiredYearFrom: value.desiredYearFrom,
        desiredYearTo: value.desiredYearTo,
        budget: value.budget,
        notes: value.notes || null
      })
      .subscribe({
        next: () => {
          this.status.set('Car request submitted successfully.');
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
        error: () => {
          this.isError.set(true);
          this.status.set('Unable to submit request right now. Please try again later.');
        }
      });
  }
}
