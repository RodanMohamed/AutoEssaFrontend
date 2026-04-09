import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AutoessaApiService } from '../../../core/services/autoessa-api.service';

interface AdminCar {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  carType: string;
  listingType: string;
  fuelType: string;
  transmissionType: string;
  mileage: number;
  location: string;
  imageUrl: string;
  isAvailable: boolean;
}

@Component({
  selector: 'app-admin-cars-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="space-y-6">
      <section class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-serif text-3xl">Cars Management</h1>
        <nav class="tabs tabs-boxed" aria-label="Dashboard sections">
          <a class="tab" routerLink="/dashboard">Overview</a>
          <a class="tab tab-active" routerLink="/dashboard/cars">Cars</a>
          <a class="tab" routerLink="/dashboard/requests">Requests</a>
          <a class="tab" routerLink="/dashboard/moderation">Moderation</a>
          <a class="tab" routerLink="/dashboard/content">Content</a>
        </nav>
      </section>

      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <h2 class="card-title">{{ selectedCarId() ? 'Edit Car' : 'Add New Car' }}</h2>

          <form [formGroup]="carForm" (ngSubmit)="saveCar()" class="grid gap-4 md:grid-cols-2">
            <label class="form-control w-full">
              <span class="label-text">Brand</span>
              <input class="input input-bordered w-full" formControlName="brand" />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Model</span>
              <input class="input input-bordered w-full" formControlName="model" />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Name</span>
              <input class="input input-bordered w-full" formControlName="name" />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Year</span>
              <input class="input input-bordered w-full" type="number" formControlName="year" />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Price</span>
              <input class="input input-bordered w-full" type="number" formControlName="price" />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Mileage</span>
              <input class="input input-bordered w-full" type="number" formControlName="mileage" />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Car Type</span>
              <input class="input input-bordered w-full" formControlName="carType" />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Listing Type</span>
              <select class="select select-bordered w-full" formControlName="listingType">
                <option value="Rent">Rent</option>
                <option value="Buy">Buy</option>
              </select>
            </label>

            <label class="form-control w-full">
              <span class="label-text">Fuel Type</span>
              <input class="input input-bordered w-full" formControlName="fuelType" />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Transmission</span>
              <input class="input input-bordered w-full" formControlName="transmissionType" />
            </label>

            <label class="form-control w-full md:col-span-2">
              <span class="label-text">Location</span>
              <input class="input input-bordered w-full" formControlName="location" />
            </label>

            <label class="form-control w-full md:col-span-2">
              <span class="label-text">Main Image URL</span>
              <input class="input input-bordered w-full" formControlName="imageUrl" />
            </label>

            <label class="label cursor-pointer justify-start gap-3 md:col-span-2">
              <input class="checkbox checkbox-primary" type="checkbox" formControlName="isAvailable" />
              <span class="label-text">Available for listing</span>
            </label>

            @if (formError()) {
              <p class="md:col-span-2 text-sm text-error">{{ formError() }}</p>
            }

            <div class="md:col-span-2 flex flex-wrap gap-2">
              <button class="btn btn-primary" type="submit" [disabled]="isSaving()">
                {{ isSaving() ? 'Saving...' : (selectedCarId() ? 'Update Car' : 'Create Car') }}
              </button>
              @if (selectedCarId()) {
                <button class="btn btn-ghost" type="button" (click)="resetForm()">Cancel Edit</button>
              }
            </div>
          </form>
        </div>
      </article>

      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <section class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="card-title">Upload Car Images</h2>
            <span class="text-sm opacity-70">Attach one or more photos for the active inventory.</span>
          </section>

          <input class="file-input file-input-bordered w-full" type="file" multiple (change)="onFilesSelected($event)" />

          <div class="flex flex-wrap gap-2">
            <button class="btn" type="button" (click)="uploadImages()" [disabled]="selectedFiles().length === 0 || isUploading()">
              {{ isUploading() ? 'Uploading...' : 'Upload Selected Images' }}
            </button>
          </div>

          @if (uploadedImages().length > 0) {
            <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              @for (image of uploadedImages(); track image) {
                <article class="rounded-xl border border-base-300 p-3">
                  <img [src]="image" alt="Car upload" class="h-36 w-full rounded-lg object-cover" />
                  <div class="mt-3 flex items-center justify-between gap-2">
                    <button class="btn btn-xs" type="button" (click)="useImageAsMain(image)">Use as Main</button>
                    <button class="btn btn-xs btn-error" type="button" (click)="deleteImage(image)">Delete</button>
                  </div>
                </article>
              }
            </section>
          }

          @if (uploadMessage()) {
            <p class="text-sm" [class]="uploadError() ? 'text-error' : 'text-success'">{{ uploadMessage() }}</p>
          }
        </div>
      </article>

      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <h2 class="card-title">Cars Inventory ({{ carsCount() }})</h2>
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (car of cars(); track car.id) {
                  <tr>
                    <td>{{ car.name }}</td>
                    <td>{{ car.listingType }} · {{ car.carType }}</td>
                    <td>{{ car.price }}</td>
                    <td>
                      <span class="badge" [class]="car.isAvailable ? 'badge-success' : 'badge-ghost'">
                        {{ car.isAvailable ? 'Available' : 'Not Available' }}
                      </span>
                    </td>
                    <td>
                      <div class="flex flex-wrap gap-2">
                        <button class="btn btn-xs" type="button" (click)="startEdit(car)">Edit</button>
                        <button class="btn btn-xs btn-error" type="button" (click)="removeCar(car.id)">Delete</button>
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
export default class AdminCarsPage {
  private readonly api = inject(AutoessaApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly cars = signal<AdminCar[]>([]);
  protected readonly selectedCarId = signal<string | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly formError = signal('');

  protected readonly selectedFiles = signal<File[]>([]);
  protected readonly uploadedImages = signal<string[]>([]);
  protected readonly isUploading = signal(false);
  protected readonly uploadMessage = signal('');
  protected readonly uploadError = signal(false);

  protected readonly carsCount = computed(() => this.cars().length);

  protected readonly carForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1990)]],
    price: [0, [Validators.required, Validators.min(1)]],
    carType: ['Sedan', Validators.required],
    listingType: ['Rent', Validators.required],
    fuelType: ['Petrol', Validators.required],
    transmissionType: ['Automatic', Validators.required],
    mileage: [0, [Validators.required, Validators.min(0)]],
    location: ['Cairo', Validators.required],
    imageUrl: ['', Validators.required],
    isAvailable: [true]
  });

  constructor() {
    this.loadCars();
  }

  protected saveCar() {
    this.formError.set('');
    if (this.carForm.invalid) {
      this.carForm.markAllAsTouched();
      this.formError.set('Please complete all required fields correctly.');
      return;
    }

    this.isSaving.set(true);
    const payload = this.toCarPayload();
    const selectedId = this.selectedCarId();

    const request$ = selectedId
      ? this.api.adminUpdateCar(selectedId, payload)
      : this.api.adminCreateCar(payload);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.resetForm();
        this.loadCars();
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        this.formError.set(this.extractError(error));
      }
    });
  }

  protected startEdit(car: AdminCar) {
    this.selectedCarId.set(car.id);
    this.carForm.patchValue({
      name: car.name,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price,
      carType: car.carType,
      listingType: car.listingType,
      fuelType: car.fuelType,
      transmissionType: car.transmissionType,
      mileage: car.mileage,
      location: car.location,
      imageUrl: car.imageUrl,
      isAvailable: car.isAvailable
    });
  }

  protected resetForm() {
    this.selectedCarId.set(null);
    this.carForm.reset({
      name: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      carType: 'Sedan',
      listingType: 'Rent',
      fuelType: 'Petrol',
      transmissionType: 'Automatic',
      mileage: 0,
      location: 'Cairo',
      imageUrl: '',
      isAvailable: true
    });
    this.formError.set('');
  }

  protected removeCar(id: string) {
    this.api.adminDeleteCar(id).subscribe({
      next: () => {
        this.loadCars();
      },
      error: (error: unknown) => {
        this.formError.set(this.extractError(error));
      }
    });
  }

  protected onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const files = input?.files ? Array.from(input.files) : [];
    this.selectedFiles.set(files);
    this.uploadMessage.set(files.length > 0 ? `${files.length} file(s) selected.` : '');
    this.uploadError.set(false);
  }

  protected uploadImages() {
    if (this.selectedFiles().length === 0) {
      this.uploadMessage.set('Choose at least one image before upload.');
      this.uploadError.set(true);
      return;
    }

    this.isUploading.set(true);
    this.uploadMessage.set('');
    this.uploadError.set(false);

    const formData = new FormData();
    for (const file of this.selectedFiles()) {
      formData.append('files', file, file.name);
    }

    this.api.adminUploadCarImages(formData).subscribe({
      next: (response) => {
        this.isUploading.set(false);
        const urls = this.extractUrls(response);
        if (urls.length === 0) {
          this.uploadMessage.set('Uploaded, but no image URLs were returned by the API.');
          this.uploadError.set(true);
          return;
        }

        this.uploadedImages.update((current) => [...urls, ...current]);
        this.uploadMessage.set('Images uploaded successfully.');
      },
      error: (error: unknown) => {
        this.isUploading.set(false);
        this.uploadMessage.set(this.extractError(error));
        this.uploadError.set(true);
      }
    });
  }

  protected deleteImage(imageUrl: string) {
    this.api.adminDeleteUploadedImage({ imageUrl }).subscribe({
      next: () => {
        this.uploadedImages.update((current) => current.filter((item) => item !== imageUrl));
        this.uploadMessage.set('Image deleted from storage.');
        this.uploadError.set(false);
      },
      error: (error: unknown) => {
        this.uploadMessage.set(this.extractError(error));
        this.uploadError.set(true);
      }
    });
  }

  protected useImageAsMain(imageUrl: string) {
    this.carForm.patchValue({ imageUrl });
  }

  private loadCars() {
    this.api.getCars().subscribe({
      next: (response) => {
        this.cars.set(this.mapCars(response));
      },
      error: () => {
        this.cars.set([]);
      }
    });
  }

  private toCarPayload(): Record<string, unknown> {
    const value = this.carForm.getRawValue();
    return {
      name: value.name,
      brand: value.brand,
      model: value.model,
      year: Number(value.year),
      price: Number(value.price),
      carType: value.carType,
      listingType: value.listingType,
      fuelType: value.fuelType,
      transmissionType: value.transmissionType,
      mileage: Number(value.mileage),
      location: value.location,
      imageUrl: value.imageUrl,
      coverImageUrl: value.imageUrl,
      images: [value.imageUrl],
      isAvailable: value.isAvailable
    };
  }

  private mapCars(payload: unknown): AdminCar[] {
    if (Array.isArray(payload)) {
      return payload.map((item, index) => this.mapCar(item, index + 1));
    }

    if (typeof payload === 'object' && payload !== null) {
      const source = payload as Record<string, unknown>;
      const collections = [source['items'], source['data'], source['value']];
      for (const collection of collections) {
        if (Array.isArray(collection)) {
          return collection.map((item, index) => this.mapCar(item, index + 1));
        }
      }
    }

    return [];
  }

  private mapCar(item: unknown, fallback: number): AdminCar {
    const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};

    return {
      id: typeof record['id'] === 'string' ? record['id'] : `car-${fallback}`,
      name: typeof record['name'] === 'string' ? record['name'] : 'Car',
      brand: typeof record['brand'] === 'string' ? record['brand'] : 'AutoEssa',
      model: typeof record['model'] === 'string' ? record['model'] : 'Edition',
      year: typeof record['year'] === 'number' ? record['year'] : new Date().getFullYear(),
      price: typeof record['price'] === 'number' ? record['price'] : 0,
      carType: typeof record['carType'] === 'string' ? record['carType'] : 'Sedan',
      listingType: typeof record['listingType'] === 'string' ? record['listingType'] : 'Rent',
      fuelType: typeof record['fuelType'] === 'string' ? record['fuelType'] : 'Petrol',
      transmissionType: typeof record['transmissionType'] === 'string' ? record['transmissionType'] : 'Automatic',
      mileage: typeof record['mileage'] === 'number' ? record['mileage'] : 0,
      location: typeof record['location'] === 'string' ? record['location'] : 'Cairo',
      imageUrl: this.extractImageUrl(record),
      isAvailable: typeof record['isAvailable'] === 'boolean' ? record['isAvailable'] : true
    };
  }

  private extractImageUrl(record: Record<string, unknown>): string {
    if (typeof record['imageUrl'] === 'string') {
      return record['imageUrl'];
    }

    if (typeof record['coverImageUrl'] === 'string') {
      return record['coverImageUrl'];
    }

    const images = record['images'];
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0];
      if (typeof first === 'string') {
        return first;
      }
      if (typeof first === 'object' && first !== null) {
        const firstRecord = first as Record<string, unknown>;
        if (typeof firstRecord['imageUrl'] === 'string') {
          return firstRecord['imageUrl'];
        }
        if (typeof firstRecord['url'] === 'string') {
          return firstRecord['url'];
        }
      }
    }

    return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80';
  }

  private extractUrls(payload: unknown): string[] {
    if (Array.isArray(payload)) {
      return payload.filter((item): item is string => typeof item === 'string');
    }

    if (typeof payload === 'object' && payload !== null) {
      const source = payload as Record<string, unknown>;
      const candidates = [source['urls'], source['imageUrls'], source['data'], source['value']];
      for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
          return candidate.filter((item): item is string => typeof item === 'string');
        }
      }

      if (typeof source['url'] === 'string') {
        return [source['url']];
      }
    }

    return [];
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

    return 'Action failed. Please verify API permissions and payload format.';
  }
}
