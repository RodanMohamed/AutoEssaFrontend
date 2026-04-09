import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BranchLocation, BranchLocationsService } from '../../../core/services/branch-locations.service';
import { AutoessaApiService } from '../../../core/services/autoessa-api.service';

interface ContactMessageItem {
  id: string;
  name: string;
  phoneNumber: string;
  message: string;
  status: number;
  statusLabel: string;
}

interface LocalizationSettingItem {
  key: string;
  value: string;
}

@Component({
  selector: 'app-admin-content-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="space-y-6">
      <section class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-serif text-3xl">Content Management</h1>
      </section>

      @if (message()) {
        <p class="text-sm" [class]="isError() ? 'text-error' : 'text-success'">{{ message() }}</p>
      }

      <section class="grid gap-6 xl:grid-cols-2">
        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body gap-4">
            <h2 class="card-title">Contact Information</h2>
            <form [formGroup]="contactForm" (ngSubmit)="saveContactInfo()" class="grid gap-4">
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">Phone Number</span>
                <input class="input input-bordered" formControlName="phoneNumber" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">WhatsApp Number</span>
                <input class="input input-bordered" formControlName="whatsAppNumber" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">Address</span>
                <input class="input input-bordered" formControlName="address" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">Google Maps URL</span>
                <input class="input input-bordered" formControlName="googleMapsUrl" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">Working Hours</span>
                <input class="input input-bordered" formControlName="workingHours" />
              </label>
              <button class="btn btn-primary" type="submit" [disabled]="contactForm.invalid || isSavingContact()">
                {{ isSavingContact() ? 'Saving...' : 'Save Contact Info' }}
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
            <h2 class="card-title">Branch Locations (3 placeholders)</h2>
            <span class="text-sm opacity-70">Admin can choose the active branch shown on Contact page.</span>
          </section>

          <div class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (branch of branches(); track branch.id) {
                    <tr>
                      <td>{{ branch.name }}</td>
                      <td>{{ branch.address }}</td>
                      <td>
                        <span class="badge" [class]="branch.isActive ? 'badge-success' : 'badge-outline'">
                          {{ branch.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td>
                        <div class="flex flex-wrap gap-2">
                          <button class="btn btn-xs" type="button" (click)="editBranch(branch)">Edit</button>
                          <button class="btn btn-xs btn-primary" type="button" (click)="activateBranch(branch.id)">Set Active</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <form [formGroup]="branchForm" (ngSubmit)="saveBranch()" class="grid gap-3">
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">Branch ID</span>
                <input class="input input-bordered" formControlName="id" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">Branch Name</span>
                <input class="input input-bordered" formControlName="name" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">Address</span>
                <input class="input input-bordered" formControlName="address" />
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">Google Maps Embed URL</span>
                <input class="input input-bordered" formControlName="mapsUrl" />
              </label>
              <label class="label cursor-pointer justify-start gap-3">
                <input class="checkbox checkbox-primary" type="checkbox" formControlName="isActive" />
                <span class="label-text">Set as active branch</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-primary" type="submit">Save Branch</button>
                <button class="btn btn-outline" type="button" (click)="newBranchForm()">New</button>
              </div>
            </form>
          </div>
        </div>
      </article>

      <section class="grid gap-6 xl:grid-cols-2">
        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body gap-4">
            <section class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="card-title " >Home Page Content</h2>
              <button class="btn btn-sm" type="button" (click)="loadHomeContent()">Refresh</button>
            </section>
            <form [formGroup]="homeContentForm" (ngSubmit)="saveHomeContent()" class="grid gap-4">
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">Hero Headline</span>
                <input class="input input-bordered" formControlName="heroHeadline" />
              </label>
              <label class="form-control content-form-row content-form-row-top">
                <span class="label-text content-form-label">Hero Sub Headline</span>
                <textarea class="textarea textarea-bordered" rows="3" formControlName="heroSubHeadline"></textarea>
              </label>
              <label class="form-control content-form-row">
                <span class="label-text content-form-label">Hero CTA Text</span>
                <input class="input input-bordered" formControlName="heroCtaText" />
              </label>
              <label class="form-control content-form-row content-form-row-top">
                <span class="label-text content-form-label">Why Choose Us Text</span>
                <textarea class="textarea textarea-bordered" rows="4" formControlName="whyChooseUsText"></textarea>
              </label>
              <button class="btn btn-primary" type="submit" [disabled]="homeContentForm.invalid || isSavingHome()">
                {{ isSavingHome() ? 'Saving...' : 'Save Home Content' }}
              </button>
            </form>
          </div>
        </article>

        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body gap-4">
            <section class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="card-title">Contact Messages</h2>
              <button class="btn btn-sm" type="button" (click)="loadContactMessages()">Refresh</button>
            </section>
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of contactMessages(); track item.id) {
                    <tr>
                      <td>{{ item.name }}</td>
                      <td>{{ item.phoneNumber }}</td>
                      <td>{{ item.message }}</td>
                      <td><span class="badge badge-outline">{{ item.statusLabel }}</span></td>
                      <td>
                        <select class="select select-bordered select-sm"
                          [value]="item.status"
                          (change)="updateContactMessageStatus(item.id, $event)">
                          <option value="0">New</option>
                          <option value="1">Contacted</option>
                          <option value="2">Closed</option>
                        </select>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
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

  protected readonly message = signal('');
  protected readonly isError = signal(false);
  protected readonly isSavingContact = signal(false);
  protected readonly isSavingHome = signal(false);
  protected readonly contactMessages = signal<ContactMessageItem[]>([]);
  protected readonly localizationSettings = signal<LocalizationSettingItem[]>([]);
  protected readonly branches = this.branchService.branches;

  protected readonly contactForm = this.fb.nonNullable.group({
    phoneNumber: ['', Validators.required],
    whatsAppNumber: ['', Validators.required],
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

  protected readonly contactMessageCount = computed(() => this.contactMessages().length);

  constructor() {
    this.loadAll();
    this.newBranchForm();
  }

  protected loadAll() {
    this.loadContactMessages();
    this.loadHomeContent();
    this.loadLocalization();
  }

  protected loadContactMessages() {
    this.api.adminGetContactMessages().subscribe({
      next: (response) => this.contactMessages.set(this.mapContactMessages(response)),
      error: () => this.contactMessages.set([])
    });
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
        this.isSavingContact.set(false);
        this.message.set('Contact information saved successfully.');
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
        this.message.set('Homepage content saved successfully.');
        this.isError.set(false);
      },
      error: (error: unknown) => {
        this.isSavingHome.set(false);
        this.message.set(this.extractError(error));
        this.isError.set(true);
      }
    });
  }

  protected updateContactMessageStatus(id: string, event: Event) {
    const target = event.target as HTMLSelectElement | null;
    const status = Number(target?.value ?? '0');

    this.api.adminUpdateContactMessageStatus(id, { status }).subscribe({
      next: () => {
        this.message.set('Contact message updated.');
        this.isError.set(false);
        this.loadContactMessages();
      },
      error: (error: unknown) => {
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
      name: `New Branch ${this.branches().length + 1}`,
      address: 'Cairo, Egypt',
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

    this.message.set('Branch location saved successfully.');
    this.isError.set(false);
  }

  protected activateBranch(id: string) {
    this.branchService.setActiveBranch(id);
    this.message.set('Active branch updated.');
    this.isError.set(false);
  }

  private mapContactMessages(payload: unknown): ContactMessageItem[] {
    return this.extractCollection(payload).map((item, index) => {
      const source = this.toRecord(item);
      const status = this.readNumber(source, 'status', 0);
      return {
        id: this.readString(source, 'id', `contact-${index + 1}`),
        name: this.readString(source, 'name', 'Unknown'),
        phoneNumber: this.readString(source, 'phoneNumber', '-'),
        message: this.readString(source, 'message', '-'),
        status,
        statusLabel: this.statusLabel(status)
      };
    });
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

  private statusLabel(status: number): string {
    if (status === 1) {
      return 'Contacted';
    }
    if (status === 2) {
      return 'Closed';
    }
    return 'New';
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

    return 'Action failed. Please verify API permissions or payload shape.';
  }
}
