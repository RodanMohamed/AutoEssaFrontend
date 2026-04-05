import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { ContactApi } from '../data-access/contact.api';
import { ContactInfo } from '../data-access/contact.interface';
import { LocaleService } from '../../../core/services/locale.service';
import { BranchLocationsService } from '../../../core/services/branch-locations.service';

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule],
  template: `
    <section class="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
      <article class="space-y-6">
        <div class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body">
            <h1 class="font-serif text-3xl">Contact Us</h1>
            <p class="text-base-content/75">{{ introText() }}</p>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-base-300 p-3">
                <p class="text-sm text-base-content/65">Phone</p>
                <p class="font-semibold">{{ contactInfo().phoneNumber }}</p>
              </div>
              <div class="rounded-xl border border-base-300 p-3">
                <p class="text-sm text-base-content/65">WhatsApp</p>
                <p class="font-semibold">{{ contactInfo().whatsAppNumber }}</p>
              </div>
            </div>

            <div class="rounded-xl border border-base-300 p-3">
              <p class="text-sm text-base-content/65">Address</p>
              <p class="font-medium">{{ activeBranch().address }}</p>
            </div>

            <div class="rounded-xl border border-base-300 p-3">
              <p class="text-sm text-base-content/65">Working Hours</p>
              <p class="font-medium">{{ contactInfo().workingHours }}</p>
            </div>

            <a class="btn btn-success bg-green-900 text-white w-full" target="_blank" rel="noopener" [href]="whatsAppLink()">Chat On WhatsApp</a>

            <div class="space-y-2">
              <p class="text-sm text-base-content/65">Branches</p>
              <div class="flex flex-wrap gap-2">
                @for (branch of branches(); track branch.id) {
                  <button
                    class="btn btn-sm"
                    type="button"
                    [class.btn-primary]="branch.id === activeBranchId()"
                    [class.btn-outline]="branch.id !== activeBranchId()"
                    (click)="chooseBranch(branch.id)">
                    {{ branch.name }}
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

        <iframe
          class="h-72 w-full rounded-2xl border border-base-300"
          title="Auto Essa Location"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          [src]="activeBranch().mapsUrl"
        ></iframe>
      </article>

      <form [formGroup]="form" (ngSubmit)="submit()" class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Name is required.</mat-error>
            }
            @if (form.controls.name.hasError('pattern')) {
              <mat-error>Name must contain letters only (no numbers).</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phoneNumber" placeholder="+2010xxxxxxx" />
            @if (form.controls.phoneNumber.hasError('required')) {
              <mat-error>Phone number is required.</mat-error>
            }
            @if (form.controls.phoneNumber.hasError('pattern')) {
              <mat-error>Please enter a valid Egyptian phone number.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Message</mat-label>
            <textarea matInput rows="5" formControlName="message"></textarea>
            @if (form.controls.message.hasError('required')) {
              <mat-error>Message is required.</mat-error>
            }
            @if (form.controls.message.hasError('minlength')) {
              <mat-error>Message must be at least 10 characters.</mat-error>
            }
          </mat-form-field>

          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Send Message</button>
          @if (status()) {
            <p class="text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">{{ status() }}</p>
          }
        </div>
      </form>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ContactPage {
  private readonly contactApi = inject(ContactApi);
  private readonly localeService = inject(LocaleService);
  private readonly branchService = inject(BranchLocationsService);

  protected readonly status = signal('');
  protected readonly isError = signal(false);
  protected readonly introText = computed(() =>
    this.localeService.locale() === 'ar'
      ? 'نرد بسرعة عبر واتساب والهاتف لمساعدة العملاء في إكمال طلبات الإيجار أو الشراء.'
      : 'We answer quickly on WhatsApp and phone to help customers complete rent or buy requests.'
  );
  protected readonly contactInfo = signal<ContactInfo>({
    phoneNumber: '+20 100 000 0000',
    whatsAppNumber: '+20 100 000 0000',
    address: 'Cairo, Egypt',
    googleMapsUrl: 'https://www.google.com/maps?q=Cairo&output=embed',
    workingHours: 'Daily 10:00 AM - 10:00 PM'
  });
  protected readonly branches = this.branchService.branches;
  protected readonly activeBranch = computed(() => this.branchService.getActiveBranch());
  protected readonly activeBranchId = computed(() => this.activeBranch().id);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[A-Za-z\u0600-\u06FF\s]{2,60}$/)] }),
    phoneNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^(?:\+20|0)?1[0-2,5]\d{8}$/)] }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] })
  });

  constructor() {
    this.contactApi.getContactInfo().subscribe((value) => this.contactInfo.set(value));
  }

  protected chooseBranch(id: string) {
    this.branchService.setActiveBranch(String(id));
  }

  protected whatsAppLink(): string {
    const number = this.contactInfo().whatsAppNumber.replace(/[^\d+]/g, '').replace(/^0/, '+20');
    const message = encodeURIComponent('Hi Auto Essa, I need support with my request.');
    return `https://wa.me/${number.replace('+', '')}?text=${message}`;
  }

  protected submit() {
    if (this.form.invalid) {
      return;
    }

    this.status.set('');
    this.isError.set(false);

    const payload = this.form.getRawValue();
    this.contactApi.sendMessage(payload).subscribe({
      next: () => {
        this.status.set('Message sent successfully.');
        this.form.reset({ name: '', phoneNumber: '', message: '' });
      },
      error: () => {
        this.isError.set(true);
        this.status.set('Unable to send message now. Please try again or use WhatsApp.');
      }
    });
  }
}
