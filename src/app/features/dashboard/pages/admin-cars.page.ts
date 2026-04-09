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
      </section>

      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <section class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="card-title">{{ selectedCarId() ? 'Edit Car' : 'Add New Car' }}</h2>
              <p class="text-sm opacity-70">Choose a main image file. The app creates the image URL payload automatically.</p>
            </div>
            @if (selectedCarId()) {
              <button class="btn btn-sm btn-ghost" type="button" (click)="resetForm()">Cancel Edit</button>
            }
          </section>

          <form class="flex w-full max-w-2xl flex-col" [formGroup]="carForm" (ngSubmit)="saveCar()">
            <label class="form-control mt-2 w-full">
              <span class="label-text">Name</span>
              <input class="input input-bordered w-full" type="text" formControlName="name" />
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Brand</span>
              <input class="input input-bordered w-full" type="text" formControlName="brand" />
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Model</span>
              <input class="input input-bordered w-full" type="text" formControlName="model" />
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Year</span>
              <input class="input input-bordered w-full" type="number" formControlName="year" />
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Price</span>
              <input class="input input-bordered w-full" type="number" formControlName="price" />
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Mileage</span>
              <input class="input input-bordered w-full" type="number" formControlName="mileage" />
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Location</span>
              <input class="input input-bordered w-full" type="text" formControlName="location" />
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Car Type</span>
              <select class="select select-bordered w-full" formControlName="carType">
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Coupe">Coupe</option>
                <option value="Pickup">Pickup</option>
              </select>
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Listing Type</span>
              <select class="select select-bordered w-full" formControlName="listingType">
                <option value="Rent">Rent</option>
                <option value="Sell">Sell</option>
              </select>
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Fuel Type</span>
              <select class="select select-bordered w-full" formControlName="fuelType">
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Transmission</span>
              <select class="select select-bordered w-full" formControlName="transmissionType">
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Availability</span>
              <select class="select select-bordered w-full" formControlName="isAvailable">
                <option [ngValue]="true">Available</option>
                <option [ngValue]="false">Not Available</option>
              </select>
            </label>

            <label class="form-control mt-2 w-full">
              <span class="label-text">Main Image File</span>
              <input class="file-input file-input-bordered w-full" type="file" accept="image/*" (change)="onMainImageSelected($event)" />
              <span class="label-text-alt opacity-70">No URL input needed. A URL payload is generated from upload response or file data.</span>
            </label>

            @if (mainImagePreview().length > 0) {
              <section class="mt-2 rounded-lg border border-base-300 bg-base-200 p-3">
                <p class="mb-2 text-sm font-semibold">Main image preview</p>
                <img class="h-44 w-full rounded-lg object-cover" [src]="mainImagePreview()" alt="Main selected car image" />
              </section>
            }

            @if (formError().length > 0) {
              <p class="mt-2 text-sm text-error">{{ formError() }}</p>
            }

            <section class="mt-2 flex flex-wrap gap-2">
              <button class="btn btn-primary" type="submit" [disabled]="isSaving()">
                {{ isSaving() ? 'Saving...' : (selectedCarId() ? 'Update Car' : 'Add Car') }}
              </button>
              <button class="btn btn-ghost" type="button" (click)="resetForm()">Reset</button>
            </section>
          </form>
        </div>
      </article>

      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body gap-4">
          <section class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="card-title">Uploaded Cars ({{ carsCount() }})</h2>
              <p class="text-sm opacity-70">These are the cars that appear in the home page and listing page.</p>
            </div>
          </section>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Brand / Model</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th>Location</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (car of cars(); track car.id) {
                  <tr>
                    <td>{{ car.name }}</td>
                    <td>{{ car.brand }} {{ car.model }}</td>
                    <td>{{ car.year }}</td>
                    <td>{{ car.price }}</td>
                    <td>{{ car.location }}</td>
                    <td>
                      <span class="badge" [class]="car.isAvailable ? 'badge-success' : 'badge-ghost'">
                        {{ car.isAvailable ? 'Available' : 'Not Available' }}
                      </span>
                    </td>
                    <td>
                      <div class="flex flex-wrap gap-2">
                        <button class="btn btn-xs" type="button" (click)="startEdit(car)">Edit</button>
                        <a class="btn btn-xs" [routerLink]="['/cars', car.id]">Open Details</a>
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
  protected readonly mainImageFile = signal<File | null>(null);
  protected readonly mainImagePreview = signal('');

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

    if (!this.selectedCarId() && !this.mainImageFile() && this.mainImagePreview().trim().length === 0) {
      this.formError.set('Please choose a main photo before saving the car.');
      return;
    }

    this.isSaving.set(true);
    const finalizeSave = (imageUrl: string) => {
      const stringPayload = this.toCarPayloadString(imageUrl);
      const numericPayload = this.toCarPayloadNumeric(imageUrl);
      const payloadCandidates: Record<string, unknown>[] = [
        { request: stringPayload },
        stringPayload,
        { request: numericPayload },
        numericPayload
      ];
      const selectedId = this.selectedCarId();
      this.executeSaveWithFallback(payloadCandidates, selectedId, 0, null);
    };

    const chosenFile = this.mainImageFile();
    if (chosenFile) {
      const formData = new FormData();
      formData.append('files', chosenFile, chosenFile.name);

      this.api.adminUploadCarImages(formData).subscribe({
        next: (response) => {
          const urls = this.extractUrls(response);
          const imageUrl = urls[0] ?? this.mainImagePreview();
          if (!imageUrl) {
            this.isSaving.set(false);
            this.formError.set('Upload succeeded but no image URL was returned.');
            return;
          }

          finalizeSave(imageUrl);
        },
        error: (error: unknown) => {
          if (this.isUnauthorized(error) || this.isForbidden(error)) {
            this.isSaving.set(false);
            this.formError.set(this.extractError(error));
            return;
          }

          const fallbackImage = this.mainImagePreview();
          if (fallbackImage) {
            finalizeSave(fallbackImage);
            return;
          }

          this.isSaving.set(false);
          this.formError.set(this.extractError(error));
        }
      });
      return;
    }

    finalizeSave(this.mainImagePreview());
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
      isAvailable: car.isAvailable
    });
    this.mainImageFile.set(null);
    this.mainImagePreview.set(car.imageUrl);
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
      isAvailable: true
    });
    this.formError.set('');
    this.mainImageFile.set(null);
    this.mainImagePreview.set('');
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
    this.mainImageFile.set(null);
    this.mainImagePreview.set(imageUrl);
  }

  protected onMainImageSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    this.mainImageFile.set(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        this.mainImagePreview.set(typeof result === 'string' ? result : '');
      };
      reader.readAsDataURL(file);
      return;
    }

    this.mainImagePreview.set('');
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

  private toCarPayloadString(imageUrl: string): Record<string, unknown> {
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
      imageUrl,
      coverImageUrl: imageUrl,
      images: [imageUrl],
      isAvailable: value.isAvailable
    };
  }

  private toCarPayloadNumeric(imageUrl: string): Record<string, unknown> {
    const value = this.carForm.getRawValue();
    return {
      name: value.name,
      brand: value.brand,
      model: value.model,
      year: Number(value.year),
      price: Number(value.price),
      carType: this.mapCarTypeToEnum(value.carType),
      listingType: this.mapListingTypeToEnum(value.listingType),
      fuelType: this.mapFuelTypeToEnum(value.fuelType),
      transmissionType: this.mapTransmissionTypeToEnum(value.transmissionType),
      mileage: Number(value.mileage),
      location: value.location,
      imageUrl,
      coverImageUrl: imageUrl,
      images: [imageUrl],
      isAvailable: value.isAvailable
    };
  }

  private executeSaveWithFallback(
    payloadCandidates: Record<string, unknown>[],
    selectedId: string | null,
    index: number,
    lastError: unknown
  ) {
    if (index >= payloadCandidates.length) {
      this.isSaving.set(false);
      this.formError.set(this.extractError(lastError));
      return;
    }

    const payload = payloadCandidates[index];
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
        if (this.shouldTryNextPayload(error)) {
          this.executeSaveWithFallback(payloadCandidates, selectedId, index + 1, error);
          return;
        }

        this.isSaving.set(false);
        this.formError.set(this.extractError(error));
      }
    });
  }

  private shouldTryNextPayload(error: unknown): boolean {
    const status = this.getHttpStatus(error);
    if (status !== 400) {
      return false;
    }

    const message = this.extractError(error).toLowerCase();
    return message.includes('request field is required') ||
      message.includes('could not be converted') ||
      message.includes('validation');
  }

  private mapListingTypeToEnum(value: string): number {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'sell') {
      return 1;
    }
    return 0;
  }

  private mapCarTypeToEnum(value: string): number {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'suv') {
      return 1;
    }
    if (normalized === 'hatchback') {
      return 2;
    }
    if (normalized === 'coupe') {
      return 3;
    }
    if (normalized === 'pickup') {
      return 4;
    }
    return 0;
  }

  private mapFuelTypeToEnum(value: string): number {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'diesel') {
      return 1;
    }
    if (normalized === 'hybrid') {
      return 2;
    }
    if (normalized === 'electric') {
      return 3;
    }
    return 0;
  }

  private mapTransmissionTypeToEnum(value: string): number {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'manual') {
      return 1;
    }
    return 0;
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
    const status = this.getHttpStatus(error);
    if (status === 401) {
      return 'Unauthorized (401): your session is missing or expired. Please login again as admin and retry.';
    }
    if (status === 403) {
      return 'Forbidden (403): your account does not have permission for this admin action.';
    }

    if (typeof error === 'object' && error !== null) {
      const source = error as Record<string, unknown>;
      const topLevelValidation = this.extractValidationMessages(source['errors']);
      if (topLevelValidation.length > 0) {
        return topLevelValidation.join(' | ');
      }

      const nested = source['error'];
      if (typeof nested === 'string' && nested.trim().length > 0) {
        return nested;
      }
      if (typeof nested === 'object' && nested !== null) {
        const nestedRecord = nested as Record<string, unknown>;
        const nestedValidation = this.extractValidationMessages(nestedRecord['errors']);
        if (nestedValidation.length > 0) {
          return nestedValidation.join(' | ');
        }
        if (typeof nestedRecord['message'] === 'string') {
          return nestedRecord['message'];
        }
        if (typeof nestedRecord['title'] === 'string') {
          return nestedRecord['title'];
        }
        if (typeof nestedRecord['detail'] === 'string' && nestedRecord['detail'].trim().length > 0) {
          return nestedRecord['detail'];
        }
      }
      if (typeof source['message'] === 'string' && source['message'].trim().length > 0) {
        return source['message'];
      }
      if (typeof source['statusText'] === 'string' && source['statusText'].trim().length > 0) {
        return source['statusText'];
      }
    }

    return 'Action failed. Please verify API permissions and payload format.';
  }

  private extractValidationMessages(errorsPayload: unknown): string[] {
    if (typeof errorsPayload !== 'object' || errorsPayload === null) {
      return [];
    }

    const errorsRecord = errorsPayload as Record<string, unknown>;
    const messages: string[] = [];

    for (const [field, value] of Object.entries(errorsRecord)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string' && item.trim().length > 0) {
            const label = this.normalizeFieldLabel(field);
            messages.push(this.toFriendlyValidationMessage(label, item));
          }
        }
      } else if (typeof value === 'string' && value.trim().length > 0) {
        const label = this.normalizeFieldLabel(field);
        messages.push(this.toFriendlyValidationMessage(label, value));
      }
    }

    return messages;
  }

  private normalizeFieldLabel(field: string): string {
    const trimmed = field.trim();
    if (!trimmed) {
      return 'Validation';
    }

    const lower = trimmed.toLowerCase();
    if (lower === 'request') {
      return 'Car Data';
    }
    if (lower === '$.listingtype' || lower === 'listingtype') {
      return 'Listing Type';
    }
    if (lower === '$.cartype' || lower === 'cartype') {
      return 'Car Type';
    }
    if (lower === '$.fueltype' || lower === 'fueltype') {
      return 'Fuel Type';
    }
    if (lower === '$.transmissiontype' || lower === 'transmissiontype') {
      return 'Transmission';
    }

    if (trimmed.startsWith('$.')) {
      const raw = trimmed.slice(2);
      const spaced = raw.replace(/([a-z])([A-Z])/g, '$1 $2');
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    }

    return trimmed;
  }

  private toFriendlyValidationMessage(label: string, message: string): string {
    const normalizedMessage = message.trim();
    const lower = normalizedMessage.toLowerCase();

    if (label === 'Car Data' && lower.includes('required')) {
      return 'Car data was not sent correctly. Please retry; if it continues, contact support.';
    }

    if (lower.includes('could not be converted')) {
      if (label === 'Listing Type') {
        return 'Listing Type is invalid. Please choose Rent or Sell.';
      }
      if (label === 'Car Type') {
        return 'Car Type is invalid. Please choose one of the provided car types.';
      }
      if (label === 'Fuel Type') {
        return 'Fuel Type is invalid. Please choose Petrol, Diesel, Hybrid, or Electric.';
      }
      if (label === 'Transmission') {
        return 'Transmission is invalid. Please choose Automatic or Manual.';
      }
    }

    if (label === 'Listing Type' && lower.includes('line') && lower.includes('bytepositioninline')) {
      return 'Listing Type format is invalid for the server. Please choose a value from the dropdown and retry.';
    }

    return `${label}: ${normalizedMessage}`;
  }

  private getHttpStatus(error: unknown): number | null {
    if (typeof error !== 'object' || error === null) {
      return null;
    }

    const source = error as Record<string, unknown>;
    const status = source['status'];
    return typeof status === 'number' ? status : null;
  }

  private isUnauthorized(error: unknown): boolean {
    return this.getHttpStatus(error) === 401;
  }

  private isForbidden(error: unknown): boolean {
    return this.getHttpStatus(error) === 403;
  }
}
