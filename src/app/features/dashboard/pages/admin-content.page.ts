import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

interface TestimonialItem {
  id: string;
  customerName: string;
  comment: string;
  rating: number;
  isPublished: boolean;
}

interface LocalizationSettingItem {
  key: string;
  value: string;
}

@Component({
  selector: 'app-admin-content-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="space-y-6">
      <section class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-serif text-3xl">Content Management</h1>
        <nav class="tabs tabs-boxed" aria-label="Dashboard sections">
          <a class="tab" routerLink="/dashboard">Overview</a>
          <a class="tab" routerLink="/dashboard/cars">Cars</a>
          <a class="tab" routerLink="/dashboard/requests">Requests</a>
          <a class="tab" routerLink="/dashboard/moderation">Moderation</a>
          <a class="tab tab-active" routerLink="/dashboard/content">Content</a>
        </nav>
      </section>

      @if (message()) {
        <p class="text-sm" [class]="isError() ? 'text-error' : 'text-success'">{{ message() }}</p>
      }

      <section class="grid gap-6 xl:grid-cols-2">
        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body gap-4">
            <h2 class="card-title">Contact Information</h2>
            <form [formGroup]="contactForm" (ngSubmit)="saveContactInfo()" class="grid gap-4">
              <label class="form-control ">
                <span class="label-text mr-2 ">Phone Number</span>
                <input class="input input-bordered" formControlName="phoneNumber" />
              </label>
              <label class="form-control">
                <span class="label-text mr-2">WhatsApp Number</span>
                <input class="input input-bordered" formControlName="whatsAppNumber" />
              </label>
              <label class="form-control">
                <span class="label-text mr-2">Address</span>
                <input class="input input-bordered" formControlName="address" />
              </label>
              <label class="form-control">
                <span class="label-text mr-2">Google Maps URL</span>
                <input class="input input-bordered" formControlName="googleMapsUrl" />
              </label>
              <label class="form-control">
                <span class="label-text">Working Hours</span>
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
              <label class="form-control">
                <span class="label-text">Branch ID</span>
                <input class="input input-bordered" formControlName="id" />
              </label>
              <label class="form-control">
                <span class="label-text">Branch Name</span>
                <input class="input input-bordered" formControlName="name" />
              </label>
              <label class="form-control">
                <span class="label-text">Address</span>
                <input class="input input-bordered" formControlName="address" />
              </label>
              <label class="form-control">
                <span class="label-text">Google Maps Embed URL</span>
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
              <label class="form-control">
                <span class="label-text mr-2">Hero Headline</span>
                <input class="input input-bordered" formControlName="heroHeadline" />
              </label>
              <label class="form-control">
                <span class="label-text mr-2">Hero Sub Headline</span>
                <textarea class="textarea textarea-bordered" rows="3" formControlName="heroSubHeadline"></textarea>
              </label>
              <label class="form-control">
                <span class="label-text mr-2">Hero CTA Text</span>
                <input class="input input-bordered" formControlName="heroCtaText" />
              </label>
              <label class="form-control ">
                <span class="label-text mr-2">Why Choose Us Text</span>
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

      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <section class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="card-title">Testimonials</h2>
            <button class="btn btn-sm" type="button" (click)="loadTestimonials()">Refresh</button>
          </section>

          <form [formGroup]="testimonialForm" (ngSubmit)="saveTestimonial()" class="grid gap-4 xl:grid-cols-4">
            <label class="form-control xl:col-span-1">
              <span class="label-text mr-2">Customer Name</span>
              <input class="input input-bordered" formControlName="customerName" />
            </label>
            <label class="form-control xl:col-span-1">
              <span class="label-text mr-2">Rating</span>
              <input class="input input-bordered" type="number" min="1" max="5" formControlName="rating" />
            </label>
            <label class="form-control xl:col-span-2">
              <span class="label-text mr-2">Comment</span>
              <input class="input input-bordered" formControlName="comment" />
            </label>
            <label class="label cursor-pointer justify-start gap-3 xl:col-span-4">
              <input class="checkbox checkbox-primary" type="checkbox" formControlName="isPublished" />
              <span class="label-text mr-2">Published</span>
            </label>
            <div class="flex flex-wrap gap-2 xl:col-span-4">
              <button class="btn btn-primary" type="submit" [disabled]="testimonialForm.invalid || isSavingTestimonial()">
                {{ isSavingTestimonial() ? 'Saving...' : (selectedTestimonialId() ? 'Update Testimonial' : 'Create Testimonial') }}
              </button>
              @if (selectedTestimonialId()) {
                <button class="btn btn-ghost" type="button" (click)="resetTestimonialForm()">Cancel Edit</button>
              }
            </div>
          </form>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Comment</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (testimonial of testimonials(); track testimonial.id) {
                  <tr>
                    <td>{{ testimonial.customerName }}</td>
                    <td>{{ testimonial.comment }}</td>
                    <td>{{ testimonial.rating }}</td>
                    <td>
                      <span class="badge" [class]="testimonial.isPublished ? 'badge-success' : 'badge-warning'">
                        {{ testimonial.isPublished ? 'Published' : 'Hidden' }}
                      </span>
                    </td>
                    <td>
                      <div class="flex flex-wrap gap-2">
                        <button class="btn btn-xs" type="button" (click)="editTestimonial(testimonial)">Edit</button>
                        <button class="btn btn-xs btn-ghost" type="button" (click)="togglePublish(testimonial)">
                          {{ testimonial.isPublished ? 'Unpublish' : 'Publish' }}
                        </button>
                        <button class="btn btn-xs btn-error" type="button" (click)="deleteTestimonial(testimonial.id)">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </section>
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
  protected readonly isSavingTestimonial = signal(false);
  protected readonly selectedTestimonialId = signal<string | null>(null);
  protected readonly contactMessages = signal<ContactMessageItem[]>([]);
  protected readonly testimonials = signal<TestimonialItem[]>([]);
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

  protected readonly testimonialForm = this.fb.nonNullable.group({
    customerName: ['', Validators.required],
    comment: ['', Validators.required],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    isPublished: [true]
  });

  protected readonly branchForm = this.fb.nonNullable.group({
    id: ['branch-1', Validators.required],
    name: ['Nasr City Branch', Validators.required],
    address: ['Nasr City, Cairo, Egypt', Validators.required],
    mapsUrl: ['https://www.google.com/maps?q=Nasr+City+Cairo&output=embed', Validators.required],
    isActive: [false]
  });

  protected readonly contactMessageCount = computed(() => this.contactMessages().length);
  protected readonly testimonialCount = computed(() => this.testimonials().length);

  constructor() {
    this.loadAll();
    this.newBranchForm();
  }

  protected loadAll() {
    this.loadContactMessages();
    this.loadHomeContent();
    this.loadTestimonials();
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

  protected loadTestimonials() {
    this.api.adminGetTestimonials().subscribe({
      next: (response) => this.testimonials.set(this.mapTestimonials(response)),
      error: () => this.testimonials.set([])
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

  protected saveTestimonial() {
    if (this.testimonialForm.invalid) {
      this.testimonialForm.markAllAsTouched();
      return;
    }

    this.isSavingTestimonial.set(true);
    this.message.set('');

    const payload = this.testimonialForm.getRawValue();
    const selectedId = this.selectedTestimonialId();
    const request$ = selectedId
      ? this.api.adminUpdateTestimonial(selectedId, payload)
      : this.api.adminCreateTestimonial(payload);

    request$.subscribe({
      next: () => {
        this.isSavingTestimonial.set(false);
        this.resetTestimonialForm();
        this.loadTestimonials();
        this.message.set(selectedId ? 'Testimonial updated successfully.' : 'Testimonial created successfully.');
        this.isError.set(false);
      },
      error: (error: unknown) => {
        this.isSavingTestimonial.set(false);
        this.message.set(this.extractError(error));
        this.isError.set(true);
      }
    });
  }

  protected editTestimonial(item: TestimonialItem) {
    this.selectedTestimonialId.set(item.id);
    this.testimonialForm.patchValue({
      customerName: item.customerName,
      comment: item.comment,
      rating: item.rating,
      isPublished: item.isPublished
    });
  }

  protected resetTestimonialForm() {
    this.selectedTestimonialId.set(null);
    this.testimonialForm.reset({
      customerName: '',
      comment: '',
      rating: 5,
      isPublished: true
    });
  }

  protected togglePublish(item: TestimonialItem) {
    this.api.adminPublishTestimonial(item.id, { isPublished: !item.isPublished }).subscribe({
      next: () => {
        this.message.set(`Testimonial ${item.isPublished ? 'hidden' : 'published'} successfully.`);
        this.isError.set(false);
        this.loadTestimonials();
      },
      error: (error: unknown) => {
        this.message.set(this.extractError(error));
        this.isError.set(true);
      }
    });
  }

  protected deleteTestimonial(id: string) {
    this.api.adminDeleteTestimonial(id).subscribe({
      next: () => {
        this.message.set('Testimonial deleted successfully.');
        this.isError.set(false);
        this.loadTestimonials();
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

  private mapTestimonials(payload: unknown): TestimonialItem[] {
    return this.extractCollection(payload).map((item, index) => {
      const source = this.toRecord(item);
      return {
        id: this.readString(source, 'id', `testimonial-${index + 1}`),
        customerName: this.readString(source, 'customerName', 'Unknown'),
        comment: this.readString(source, 'comment', '-'),
        rating: this.readNumber(source, 'rating', 0),
        isPublished: this.readBoolean(source, 'isPublished', false)
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
