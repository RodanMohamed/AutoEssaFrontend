import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BranchLocation, BranchLocationsService } from '../../../core/services/branch-locations.service';
import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { LocaleService } from '../../../core/services/locale.service';

interface LocalizationSettingItem {
  key: string;
  value: string;
}

const EGYPTIAN_MOBILE_REGEX = /^(?:\+20|0)?1[0125]\d{8}$/;

const EN_COPY = {
  pageTitle: 'Content Management',
  contactInformation: 'Contact Information',
  phoneNumber: 'Phone Number',
  whatsappNumber: 'WhatsApp Number',
  phoneRequired: 'Phone number is required.',
  whatsappRequired: 'WhatsApp number is required.',
  invalidEgyptianNumber: 'Please enter a valid Egyptian mobile number (e.g. 01012345678 or +201012345678).',
  address: 'Address',
  googleMapsUrl: 'Google Maps URL',
  workingHours: 'Working Hours',
  saving: 'Saving...',
  saveContactInfo: 'Save Contact Info',
  branchLocationsTitle: 'Branch Locations (3 placeholders)',
  branchLocationsHint: 'Admin can choose the active branch shown on Contact page.',
  branch: 'Branch',
  status: 'Status',
  actions: 'Actions',
  active: 'Active',
  inactive: 'Inactive',
  edit: 'Edit',
  setActive: 'Set Active',
  delete: 'Delete',
  branchId: 'Branch ID',
  branchName: 'Branch Name',
  googleMapsEmbedUrl: 'Google Maps Embed URL',
  setAsActiveBranch: 'Set as active branch',
  saveBranch: 'Save Branch',
  new: 'New',
  homePageContent: 'Home Page Content',
  refresh: 'Refresh',
  heroHeadline: 'Hero Headline',
  heroSubHeadline: 'Hero Sub Headline',
  heroCtaText: 'Hero CTA Text',
  whyChooseUsText: 'Why Choose Us Text',
  saveHomeContent: 'Save Home Content',
  name: 'Name',
  phone: 'Phone',
  message: 'Message',
  action: 'Action',
  contacted: 'Contacted',
  closed: 'Closed',
  contactInformationSaved: 'Contact information saved successfully.',
  homeContentSaved: 'Homepage content saved successfully.',
  contactMessageUpdated: 'Contact message updated.',
  branchSaved: 'Branch location saved successfully.',
  activeBranchUpdated: 'Active branch updated.',
  branchDeleted: 'Branch deleted successfully.',
  branchDeleteBlocked: 'At least one branch location must remain.',
  unknown: 'Unknown',
  fallbackError: 'Action failed. Please verify API permissions or payload shape.',
  newBranchPrefix: 'New Branch',
  cairoEgypt: 'Cairo, Egypt'
};

const AR_COPY: typeof EN_COPY = {
  pageTitle: 'إدارة المحتوى',
  contactInformation: 'معلومات التواصل',
  phoneNumber: 'رقم الهاتف',
  whatsappNumber: 'رقم واتساب',
  phoneRequired: 'رقم الهاتف مطلوب.',
  whatsappRequired: 'رقم واتساب مطلوب.',
  invalidEgyptianNumber: 'يرجى إدخال رقم موبايل مصري صحيح (مثال: 01012345678 أو +201012345678).',
  address: 'العنوان',
  googleMapsUrl: 'رابط خرائط جوجل',
  workingHours: 'ساعات العمل',
  saving: 'جارٍ الحفظ...',
  saveContactInfo: 'حفظ معلومات التواصل',
  branchLocationsTitle: 'مواقع الفروع (3 عناصر افتراضية)',
  branchLocationsHint: 'يمكن للمسؤول اختيار الفرع النشط المعروض في صفحة التواصل.',
  branch: 'الفرع',
  status: 'الحالة',
  actions: 'الإجراءات',
  active: 'نشط',
  inactive: 'غير نشط',
  edit: 'تعديل',
  setActive: 'تعيين كنشط',
  delete: 'حذف',
  branchId: 'معرف الفرع',
  branchName: 'اسم الفرع',
  googleMapsEmbedUrl: 'رابط تضمين خرائط جوجل',
  setAsActiveBranch: 'تعيين كفرع نشط',
  saveBranch: 'حفظ الفرع',
  new: 'جديد',
  homePageContent: 'محتوى الصفحة الرئيسية',
  refresh: 'تحديث',
  heroHeadline: 'العنوان الرئيسي',
  heroSubHeadline: 'العنوان الفرعي الرئيسي',
  heroCtaText: 'نص زر الدعوة للإجراء',
  whyChooseUsText: 'نص لماذا تختارنا',
  saveHomeContent: 'حفظ محتوى الصفحة الرئيسية',
  name: 'الاسم',
  phone: 'الهاتف',
  message: 'الرسالة',
  action: 'الإجراء',
  contacted: 'تم التواصل',
  closed: 'مغلق',
  contactInformationSaved: 'تم حفظ معلومات التواصل بنجاح.',
  homeContentSaved: 'تم حفظ محتوى الصفحة الرئيسية بنجاح.',
  contactMessageUpdated: 'تم تحديث رسالة التواصل.',
  branchSaved: 'تم حفظ موقع الفرع بنجاح.',
  activeBranchUpdated: 'تم تحديث الفرع النشط.',
  branchDeleted: 'تم حذف الفرع بنجاح.',
  branchDeleteBlocked: 'يجب أن يبقى فرع واحد على الأقل.',
  unknown: 'غير معروف',
  fallbackError: 'فشل الإجراء. يرجى التحقق من الصلاحيات أو صيغة البيانات.',
  newBranchPrefix: 'فرع جديد',
  cairoEgypt: 'القاهرة، مصر'
};

@Component({
  selector: 'app-admin-content-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="space-y-6">
      <section class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-serif text-3xl">{{ copy().pageTitle }}</h1>
      </section>

      @if (message()) {
        <p class="text-sm" [class]="isError() ? 'text-error' : 'text-success'">{{ message() }}</p>
      }

      <section class="grid gap-6 xl:grid-cols-2">
        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body gap-4">
            <h2 class="card-title">{{ copy().contactInformation }}</h2>
            <form [formGroup]="contactForm" (ngSubmit)="saveContactInfo()" class="grid gap-4">
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">{{ copy().phoneNumber }}</span>
                <input class="input input-bordered" type="tel" formControlName="phoneNumber" />
              </label>
              @if (contactForm.controls.phoneNumber.touched && contactForm.controls.phoneNumber.hasError('required')) {
                <p class="text-error text-xs">{{ copy().phoneRequired }}</p>
              }
              @if (contactForm.controls.phoneNumber.touched && contactForm.controls.phoneNumber.hasError('pattern')) {
                <p class="text-error text-xs">{{ copy().invalidEgyptianNumber }}</p>
              }

              <label class="form-control content-form-row">
                <span class="label-text content-form-label">{{ copy().whatsappNumber }}</span>
                <input class="input input-bordered" type="tel" formControlName="whatsAppNumber" />
              </label>
              @if (contactForm.controls.whatsAppNumber.touched && contactForm.controls.whatsAppNumber.hasError('required')) {
                <p class="text-error text-xs">{{ copy().whatsappRequired }}</p>
              }
              @if (contactForm.controls.whatsAppNumber.touched && contactForm.controls.whatsAppNumber.hasError('pattern')) {
                <p class="text-error text-xs">{{ copy().invalidEgyptianNumber }}</p>
              }

              <label class="form-control content-form-row">
                <span class="label-text content-form-label">{{ copy().address }}</span>
                <input class="input input-bordered" formControlName="address" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">{{ copy().googleMapsUrl }}</span>
                <input class="input input-bordered" formControlName="googleMapsUrl" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">{{ copy().workingHours }}</span>
                <input class="input input-bordered" formControlName="workingHours" />
              </label>
              <button class="btn btn-primary" type="submit" [disabled]="contactForm.invalid || isSavingContact()">
                {{ isSavingContact() ? copy().saving : copy().saveContactInfo }}
              </button>
            </form>
          </div>
        </article>

        <!-- <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body gap-4">
            <section class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="card-title">Localization Settings</h2>
              <button class="btn btn-sm" type="button" (click)="loadLocalization()">Refresh</button>
            </section>
            <div class="grid gap-3">
              @for (item of localizationSettings(); track item.key) {
                <div class="rounded-xl border border-base-300 p-3">
                  <p class="text-sm opacity-70">{{ item.key }}</p>
                  <p class="font-medium">{{ item.value }}</p>
                </div>
              }
            </div>
          </div>
        </article> -->
      </section>

      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <section class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="card-title">{{ copy().branchLocationsTitle }}</h2>
            <span class="text-sm opacity-70">{{ copy().branchLocationsHint }}</span>
          </section>

          <div class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div class="hidden overflow-x-auto md:block">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>{{ copy().branch }}</th>
                    <th>{{ copy().address }}</th>
                    <th>{{ copy().status }}</th>
                    <th>{{ copy().actions }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (branch of branches(); track branch.id) {
                    <tr>
                      <td>{{ branch.name }}</td>
                      <td>{{ branch.address }}</td>
                      <td>
                        <span class="badge" [class]="branch.isActive ? 'badge-success' : 'badge-outline'">
                          {{ branch.isActive ? copy().active : copy().inactive }}
                        </span>
                      </td>
                      <td>
                        <div class="flex flex-wrap gap-2">
                          <button class="btn btn-xs w-14" type="button" (click)="editBranch(branch)">{{ copy().edit }}</button>
                          <button class="btn btn-xs btn-primary" type="button" (click)="activateBranch(branch.id)">{{ copy().setActive }}</button>
                          <button class="btn btn-xs btn-error w-14" type="button" (click)="deleteBranch(branch.id)">{{ copy().delete }}</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              </div>

              <div class="grid gap-3 md:hidden">
                @for (branch of branches(); track branch.id) {
                  <article class="rounded-xl border border-base-300 bg-base-100 p-3">
                    <div class="flex items-start justify-between gap-2">
                      <h3 class="font-semibold">{{ branch.name }}</h3>
                      <span class="badge" [class]="branch.isActive ? 'badge-success' : 'badge-outline'">
                        {{ branch.isActive ? copy().active : copy().inactive }}
                      </span>
                    </div>
                    <p class="mt-2 text-sm text-base-content/75">{{ branch.address }}</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <button class="btn btn-xs" type="button" (click)="editBranch(branch)">{{ copy().edit }}</button>
                      <button class="btn btn-xs btn-primary" type="button" (click)="activateBranch(branch.id)">{{ copy().setActive }}</button>
                      <button class="btn btn-xs btn-error" type="button" (click)="deleteBranch(branch.id)">{{ copy().delete }}</button>
                    </div>
                  </article>
                }
              </div>
            </div>

            <form [formGroup]="branchForm" (ngSubmit)="saveBranch()" class="grid gap-3">
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">{{ copy().branchId }}</span>
                <input class="input input-bordered" formControlName="id" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">{{ copy().branchName }}</span>
                <input class="input input-bordered" formControlName="name" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">{{ copy().address }}</span>
                <input class="input input-bordered" formControlName="address" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">{{ copy().googleMapsEmbedUrl }}</span>
                <input class="input input-bordered" formControlName="mapsUrl" />
              </label>
              <label class="label cursor-pointer justify-start gap-3">
                <input class="checkbox checkbox-primary" type="checkbox" formControlName="isActive" />
                <span class="label-text">{{ copy().setAsActiveBranch }}</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-primary" type="submit">{{ copy().saveBranch }}</button>
                <button class="btn btn-outline" type="button" (click)="newBranchForm()">{{ copy().new }}</button>
              </div>
            </form>
          </div>
        </div>
      </article>

      <section class="grid gap-6 xl:grid-cols-2">
        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body gap-4">
            <section class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="card-title " >{{ copy().homePageContent }}</h2>
              <button class="btn btn-sm" type="button" (click)="loadHomeContent()">{{ copy().refresh }}</button>
            </section>
            <form [formGroup]="homeContentForm" (ngSubmit)="saveHomeContent()" class="grid gap-4">
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">{{ copy().heroHeadline }}</span>
                <input class="input input-bordered" formControlName="heroHeadline" />
              </label>
              <label class="form-control content-form-row content-form-row-top">
                <span class="label-text content-form-label">{{ copy().heroSubHeadline }}</span>
                <textarea class="textarea textarea-bordered" rows="3" formControlName="heroSubHeadline"></textarea>
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">{{ copy().heroCtaText }}</span>
                <input class="input input-bordered" formControlName="heroCtaText" />
              </label>
              <label class="form-control content-form-row content-form-row-top">
                <span class="label-text content-form-label">{{ copy().whyChooseUsText }}</span>
                <textarea class="textarea textarea-bordered" rows="4" formControlName="whyChooseUsText"></textarea>
              </label>
              <button class="btn btn-primary" type="submit" [disabled]="homeContentForm.invalid || isSavingHome()">
                {{ isSavingHome() ? copy().saving : copy().saveHomeContent }}
              </button>
            </form>
          </div>
        </article>
      </section>

    </section>
  `,
  styles: `
    .content-form-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .content-form-row-top {
      align-items: flex-start;
    }

    .content-form-label {
      min-width: 11rem;
      margin-bottom: 0;
    }

    .content-form-row .input,
    .content-form-row .textarea,
    .content-form-row .select {
      flex: 1;
      width: 100%;
    }

    @media (max-width: 767px) {
      .content-form-row {
        flex-direction: column;
        align-items: stretch;
        gap: 0.45rem;
      }

      .content-form-label {
        min-width: 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AdminContentPage {
  private readonly api = inject(AutoessaApiService);
  private readonly fb = inject(FormBuilder);
  private readonly branchService = inject(BranchLocationsService);
  private readonly localeService = inject(LocaleService);

  protected readonly message = signal('');
  protected readonly isError = signal(false);
  protected readonly isSavingContact = signal(false);
  protected readonly isSavingHome = signal(false);
  protected readonly localizationSettings = signal<LocalizationSettingItem[]>([]);
  protected readonly branches = this.branchService.branches;
  protected readonly copy = computed(() => (this.localeService.locale() === 'ar' ? AR_COPY : EN_COPY));

  protected readonly contactForm = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(EGYPTIAN_MOBILE_REGEX)]],
    whatsAppNumber: ['', [Validators.required, Validators.pattern(EGYPTIAN_MOBILE_REGEX)]],
    address: ['', Validators.required],
    googleMapsUrl: ['', Validators.required],
    workingHours: ['', Validators.required]
  });

  protected readonly homeContentForm = this.fb.nonNullable.group({
    heroHeadline: ['', Validators.required],
    heroSubHeadline: ['', Validators.required],
    heroCtaText: ['', Validators.required],
    whyChooseUsText: ['', Validators.required]
  });

  protected readonly branchForm = this.fb.nonNullable.group({
    id: ['branch-1', Validators.required],
    name: ['Nasr City Branch', Validators.required],
    address: ['Nasr City, Cairo, Egypt', Validators.required],
    mapsUrl: ['https://www.google.com/maps?q=Nasr+City+Cairo&output=embed', Validators.required],
    isActive: [false]
  });

  constructor() {
    this.loadAll();
    this.newBranchForm();
  }

  protected loadAll() {
    this.loadHomeContent();
    this.loadLocalization();
  }

  protected loadHomeContent() {
    this.api.getHomeContent().subscribe({
      next: (response) => {
        const value = this.toRecord(response);
        this.homeContentForm.patchValue({
          heroHeadline: this.readString(value, 'heroHeadline', ''),
          heroSubHeadline: this.readString(value, 'heroSubHeadline', ''),
          heroCtaText: this.readString(value, 'heroCtaText', ''),
          whyChooseUsText: this.readString(value, 'whyChooseUsText', '')
        });
      }
    });
  }

  protected loadLocalization() {
    this.api.getLocalizationSettings().subscribe({
      next: (response) => this.localizationSettings.set(this.mapLocalization(response)),
      error: () => this.localizationSettings.set([])
    });
  }

  protected saveContactInfo() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSavingContact.set(true);
    this.message.set('');

    this.api.adminUpdateContactInfo(this.contactForm.getRawValue()).subscribe({
      next: () => {
        const value = this.contactForm.getRawValue();
        this.branchService.syncActiveBranchDetails(value.address, value.googleMapsUrl);
        this.isSavingContact.set(false);
        this.message.set(this.copy().contactInformationSaved);
        this.isError.set(false);
      },
      error: (error: unknown) => {
        this.isSavingContact.set(false);
        this.message.set(this.extractError(error));
        this.isError.set(true);
      }
    });
  }

  protected saveHomeContent() {
    if (this.homeContentForm.invalid) {
      this.homeContentForm.markAllAsTouched();
      return;
    }

    this.isSavingHome.set(true);
    this.message.set('');

    this.api.adminUpdateHomeContent(this.homeContentForm.getRawValue()).subscribe({
      next: () => {
        this.isSavingHome.set(false);
        this.message.set(this.copy().homeContentSaved);
        this.isError.set(false);
      },
      error: (error: unknown) => {
        this.isSavingHome.set(false);
        this.message.set(this.extractError(error));
        this.isError.set(true);
      }
    });
  }

  protected editBranch(branch: BranchLocation) {
    this.branchForm.reset({
      id: branch.id,
      name: branch.name,
      address: branch.address,
      mapsUrl: branch.mapsUrl,
      isActive: branch.isActive
    });
  }

  protected newBranchForm() {
    const nextId = `branch-${this.branches().length + 1}`;
    this.branchForm.reset({
      id: nextId,
      name: `${this.copy().newBranchPrefix} ${this.branches().length + 1}`,
      address: this.copy().cairoEgypt,
      mapsUrl: 'https://www.google.com/maps?q=Cairo&output=embed',
      isActive: false
    });
  }

  protected saveBranch() {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }

    const value = this.branchForm.getRawValue();
    this.branchService.saveBranch(
      {
        id: value.id,
        name: value.name,
        address: value.address,
        mapsUrl: value.mapsUrl
      },
      value.isActive
    );

    this.message.set(this.copy().branchSaved);
    this.isError.set(false);
  }

  protected activateBranch(id: string) {
    this.branchService.setActiveBranch(id);
    this.message.set(this.copy().activeBranchUpdated);
    this.isError.set(false);
  }

  protected deleteBranch(id: string) {
    const deleted = this.branchService.deleteBranch(id);
    if (!deleted) {
      this.message.set(this.copy().branchDeleteBlocked);
      this.isError.set(true);
      return;
    }

    this.message.set(this.copy().branchDeleted);
    this.isError.set(false);
    this.newBranchForm();
  }

  private mapLocalization(payload: unknown): LocalizationSettingItem[] {
    const source = this.toRecord(payload);
    return Object.entries(source).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value)
    }));
  }

  private extractCollection(payload: unknown): unknown[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (typeof payload === 'object' && payload !== null) {
      const source = payload as Record<string, unknown>;
      const candidates = [source['items'], source['data'], source['value']];
      for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
          return candidate;
        }
      }
    }

    return [];
  }

  private toRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  }

  private readString(source: Record<string, unknown>, key: string, fallback: string): string {
    const value = source[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  }

  private readNumber(source: Record<string, unknown>, key: string, fallback: number): number {
    const value = source[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  private readBoolean(source: Record<string, unknown>, key: string, fallback: boolean): boolean {
    const value = source[key];
    return typeof value === 'boolean' ? value : fallback;
  }

  private extractError(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const source = error as Record<string, unknown>;
      const nested = source['error'];
      if (typeof nested === 'string' && nested.trim().length > 0) {
        return nested;
      }
      if (typeof nested === 'object' && nested !== null) {
        const nestedRecord = nested as Record<string, unknown>;
        if (typeof nestedRecord['message'] === 'string') {
          return nestedRecord['message'];
        }
        if (typeof nestedRecord['title'] === 'string') {
          return nestedRecord['title'];
        }
      }
      if (typeof source['message'] === 'string' && source['message'].trim().length > 0) {
        return source['message'];
      }
    }

    return this.copy().fallbackError;
  }
}
