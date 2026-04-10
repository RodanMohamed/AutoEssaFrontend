import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { CarsApi } from '../data-access/cars.api';
import { Car } from '../data-access/cars.interface';
import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { LocaleService } from '../../../core/services/locale.service';
import { AuthStore } from '../../auth/data-access/auth.store';
import { FormBuilder } from '@angular/forms';
import { extractApiErrorMessage } from '../../auth/utils/auth.helpers';

@Component({
  selector: 'app-car-details-page',
  imports: [CurrencyPipe, DecimalPipe, MatButtonModule, ReactiveFormsModule],
  template: `
    @if (car()) {
      <section class="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <img [src]="car()!.imageUrl" [alt]="car()!.brand + ' ' + car()!.model" class="h-full min-h-80 w-full rounded-2xl object-cover" />

        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body">
            <h1 class="font-serif text-3xl">{{ car()!.brand }} {{ car()!.model }}</h1>
            <p class="text-base-content/70">{{ car()!.year }} . {{ car()!.location }}</p>

            <div class="grid gap-2 rounded-xl bg-base-200/70 p-4 text-sm">
              <p>{{ copy().transmissionLabel }}: {{ car()!.transmissionType }}</p>
              <p>{{ copy().fuelLabel }}: {{ car()!.fuelType }}</p>
              <p>{{ copy().mileageLabel }}: {{ car()!.mileage | number }} km</p>
              <p>{{ copy().typeLabel }}: {{ listingTypeLabel() }}</p>
            </div>

            <p class="text-2xl font-semibold text-primary">{{ car()!.price | currency: 'EGP ' : 'symbol' : '1.0-0' }}</p>

            <div class="flex flex-wrap gap-3">
              <a mat-flat-button color="primary" [href]="whatsAppLink()" target="_blank" rel="noopener">{{ copy().whatsAppButton }}</a>
              <a mat-stroked-button href="tel:+201096060677">{{ copy().callButton }}</a>
              <button
                class="btn btn-circle btn-outline"
                type="button"
                [attr.aria-label]="isFavorite() ? copy().removeFavorite : copy().addFavorite"
                [title]="isFavorite() ? copy().removeFavorite : copy().addFavorite"
                (click)="toggleFavorite()">
                <svg
                  class="h-5 w-5 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  [attr.stroke]="isFavorite() ? 'currentColor' : 'currentColor'"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  [class.text-error]="isFavorite()"
                  [class.fill-current]="isFavorite()">
                  <path d="M12 21s-7.2-4.35-9.54-8.15A5.75 5.75 0 0 1 12 5.57a5.75 5.75 0 0 1 9.54 7.28C19.2 16.65 12 21 12 21z" />
                </svg>
              </button>
            </div>

            @if (actionStatus()) {
              <p class="text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">{{ actionStatus() }}</p>
            }
          </div>
        </article>

        @if (!isAdmin()) {
          <article class="card border border-base-300 bg-base-100 shadow">
            <div class="card-body">
              <h2 class="card-title">{{ copy().bookingTitle }}</h2>
              <form [formGroup]="bookingForm" (ngSubmit)="submitBooking()" class="grid gap-3 md:grid-cols-2">
                <label class="form-control md:col-span-2">
                  <span class="label-text">{{ copy().fullNameLabel }}</span>
                  <input class="input input-bordered ml-2" formControlName="fullName" type="text" />
                  @if (isBookingControlInvalid('fullName')) {
                    <span class="form-error-text text-sm">{{ copy().requiredError }}</span>
                  }
                </label>
                <label class="form-control md:col-span-2">
                  <span class="label-text">{{ copy().phoneLabel }}</span>
                  <input class="input input-bordered ml-2" formControlName="phoneNumber" type="text" />
                  @if (isBookingControlInvalid('phoneNumber')) {
                    <span class="form-error-text text-sm">{{ copy().requiredError }}</span>
                  }
                </label>
                <label class="form-control">
                  <span class="label-text">{{ copy().startDateLabel }}</span>
                  <input class="input input-bordered ml-2" formControlName="startDate" type="date" />
                </label>
                <label class="form-control">
                  <span class="label-text">{{ copy().endDateLabel }}</span>
                  <input class="input input-bordered ml-2" formControlName="endDate" type="date" />
                </label>
                <label class="form-control md:col-span-2">
                  <span class="label-text">{{ copy().messageLabel }}</span>
                  <textarea class="textarea textarea-bordered ml-2" formControlName="message" rows="3"></textarea>
                </label>
                <div class="md:col-span-2 flex gap-2">
                  <button class="btn btn-primary" type="submit" [disabled]="bookingForm.invalid">{{ copy().sendRequestButton }}</button>
                  <button class="btn btn-outline" type="button" (click)="checkAvailability()">{{ copy().availabilityButton }}</button>
                </div>
              </form>
            </div>
          </article>
        }

          @if (isAdmin() && car()) {
            <article class="card border border-base-300 bg-base-100 shadow xl:col-span-2">
              <div class="card-body">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 class="card-title">Edit Car Details</h2>
                    <p class="text-sm text-base-content/70">Update the car information or replace the main photo.</p>
                  </div>
                </div>

                <form [formGroup]="editForm" (ngSubmit)="saveCarChanges()" class="grid gap-3 md:grid-cols-2">
                  <label class="form-control">
                    <span class="label-text">Brand</span>
                    <input class="input input-bordered ml-2" formControlName="brand" type="text" />
                  </label>

                  <label class="form-control">
                    <span class="label-text">Model</span>
                    <input class="input input-bordered ml-2" formControlName="model" type="text" />
                  </label>

                  <label class="form-control">
                    <span class="label-text">Name</span>
                    <input class="input input-bordered ml-2" formControlName="name" type="text" />
                  </label>

                  <label class="form-control">
                    <span class="label-text">Year</span>
                    <input class="input input-bordered ml-2" formControlName="year" type="number" />
                  </label>

                  <label class="form-control">
                    <span class="label-text">Price</span>
                    <input class="input input-bordered ml-2" formControlName="price" type="number" />
                  </label>

                  <label class="form-control">
                    <span class="label-text">Mileage</span>
                    <input class="input input-bordered ml-2" formControlName="mileage" type="number" />
                  </label>

                  <label class="form-control">
                    <span class="label-text">Car Type</span>
                    <input class="input input-bordered ml-2" formControlName="carType" type="text" />
                  </label>

                  <label class="form-control">
                    <span class="label-text">Listing Type</span>
                    <select class="select select-bordered ml-2" formControlName="listingType">
                      <option value="Rent">Rent</option>
                      <option value="Buy">Buy</option>
                    </select>
                  </label>

                  <label class="form-control">
                    <span class="label-text">Fuel Type</span>
                    <input class="input input-bordered ml-2" formControlName="fuelType" type="text" />
                  </label>

                  <label class="form-control">
                    <span class="label-text">Transmission</span>
                    <input class="input input-bordered ml-2" formControlName="transmissionType" type="text" />
                  </label>

                  <label class="form-control md:col-span-2">
                    <span class="label-text">Location</span>
                    <input class="input input-bordered ml-2" formControlName="location" type="text" />
                  </label>

                  <label class="form-control md:col-span-2">
                    <span class="label-text">Main Photo</span>
                    <input class="file-input file-input-bordered w-full" type="file" accept="image/*" (change)="onAdminImageSelected($event)" />
                    @if (mainImagePreview()) {
                      <div class="mt-3 overflow-hidden rounded-xl border border-base-300">
                        <img [src]="mainImagePreview()" alt="Selected car photo" class="h-44 w-full object-cover" />
                      </div>
                    }
                  </label>

                  <label class="label cursor-pointer justify-start gap-3 md:col-span-2">
                    <input class="checkbox checkbox-primary" type="checkbox" formControlName="isAvailable" />
                    <span class="label-text">Available for listing</span>
                  </label>

                  @if (editMessage()) {
                    <p class="md:col-span-2 text-sm" [class.text-success]="!editError()" [class.text-error]="editError()">{{ editMessage() }}</p>
                  }

                  <div class="md:col-span-2 flex flex-wrap gap-2">
                    <button class="btn btn-primary" type="submit" [disabled]="isSavingCar()">
                      {{ isSavingCar() ? 'Saving...' : 'Save Changes' }}
                    </button>
                    <button class="btn btn-ghost" type="button" (click)="reloadCar()">Refresh</button>
                  </div>
                </form>
              </div>
            </article>
          }


      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class CarDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly carsApi = inject(CarsApi);
  private readonly api = inject(AutoessaApiService);
  private readonly localeService = inject(LocaleService);
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  protected readonly car = signal<Car | null>(null);
  protected readonly isFavorite = signal(false);
  protected readonly actionStatus = signal('');
  protected readonly isError = signal(false);
  protected readonly editMessage = signal('');
  protected readonly editError = signal(false);
  protected readonly waLink = signal('');
  protected readonly isSavingCar = signal(false);
  protected readonly mainImageFile = signal<File | null>(null);
  protected readonly mainImagePreview = signal('');
  protected readonly isAdmin = computed(() => this.authStore.isAdmin());
  protected readonly copy = computed(() =>
    this.localeService.locale() === 'ar'
      ? {
          transmissionLabel: 'ناقل الحركة',
          fuelLabel: 'الوقود',
          mileageLabel: 'العداد',
          typeLabel: 'النوع',
          whatsAppButton: 'احجز عبر واتساب',
          callButton: 'اتصل الآن',
          addFavorite: 'إضافة للمفضلة',
          removeFavorite: 'إزالة من المفضلة',
          bookingTitle: 'طلب حجز',
          fullNameLabel: 'الاسم الكامل',
          phoneLabel: 'رقم الهاتف',
          startDateLabel: 'تاريخ البداية',
          endDateLabel: 'تاريخ النهاية',
          messageLabel: 'رسالة',
          sendRequestButton: 'إرسال الطلب',
          availabilityButton: 'تحقق من التوفر',
          requiredError: 'هذا الحقل مطلوب',
          validationError: 'يرجى مراجعة الحقول المحددة ثم المحاولة مرة أخرى.'
        }
      : {
          transmissionLabel: 'Transmission',
          fuelLabel: 'Fuel',
          mileageLabel: 'Mileage',
          typeLabel: 'Type',
          whatsAppButton: 'Book via WhatsApp',
          callButton: 'Call now',
          addFavorite: 'Add Favorite',
          removeFavorite: 'Remove Favorite',
          bookingTitle: 'Booking Request',
          fullNameLabel: 'Full Name',
          phoneLabel: 'Phone Number',
          startDateLabel: 'Start Date',
          endDateLabel: 'End Date',
          messageLabel: 'Message',
          sendRequestButton: 'Send Request',
          availabilityButton: 'Check Availability',
          requiredError: 'This field is required.',
          validationError: 'Please review the highlighted fields and try again.'
        }
  );
  protected readonly listingTypeLabel = computed(() =>
    this.localeService.locale() === 'ar'
      ? this.car()?.listingType === 'Rent'
        ? 'إيجار'
        : 'شراء'
      : this.car()?.listingType ?? ''
  );

  protected readonly bookingForm = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phoneNumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    message: new FormControl('', { nonNullable: true }),
    startDate: new FormControl<string | null>(null),
    endDate: new FormControl<string | null>(null)
  });

  protected readonly editForm = this.fb.nonNullable.group({
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
    this.reloadCar();
  }

  protected reloadCar() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.carsApi.getCarById(id).subscribe((car) => {
      this.car.set(car);
      this.patchEditForm(car);
    });
    this.loadFavoriteState(id);
    this.loadWhatsAppLink(id);
  }

  protected whatsAppLink() {
    if (this.waLink()) {
      return this.waLink();
    }

    const selectedCar = this.car();
    const text = selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : 'this car';
    return `https://wa.me/201096060677?text=${encodeURIComponent(`Hi, I am interested in ${text}`)}`;
  }

  protected toggleFavorite() {
    if (!this.authStore.isAuthenticated()) {
      this.isError.set(true);
      this.actionStatus.set('Please login first to manage favorites.');
      return;
    }

    const carId = this.car()?.id;
    if (!carId) {
      return;
    }

    this.actionStatus.set('');
    this.isError.set(false);

    const request$ = this.isFavorite() ? this.api.removeFavorite(carId) : this.api.addFavorite(carId);
    request$.subscribe({
      next: () => {
        this.isFavorite.set(!this.isFavorite());
        this.actionStatus.set(this.isFavorite() ? 'Added to favorites.' : 'Removed from favorites.');
      },
      error: () => {
        this.isError.set(true);
        this.actionStatus.set('Unable to update favorite now.');
      }
    });
  }

  protected submitBooking() {
    const carId = this.car()?.id;
    if (!carId) {
      return;
    }

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.isError.set(true);
      this.actionStatus.set(this.copy().validationError);
      return;
    }

    const value = this.bookingForm.getRawValue();
    this.api
      .createBookingRequest({
        carId,
        fullName: value.fullName,
        phoneNumber: value.phoneNumber,
        message: value.message || null,
        startDate: value.startDate ?? null,
        endDate: value.endDate ?? null
      })
      .subscribe({
        next: () => {
          this.isError.set(false);
          this.actionStatus.set('Booking request sent successfully.');
          this.bookingForm.reset({ fullName: '', phoneNumber: '', message: '', startDate: null, endDate: null });
        },
        error: (error: unknown) => {
          this.isError.set(true);
          this.actionStatus.set(
            extractApiErrorMessage(error, 'Unable to send your booking request right now. Please try again.')
          );
        }
      });
  }

  protected checkAvailability() {
    const carId = this.car()?.id;
    if (!carId) {
      return;
    }

    const value = this.bookingForm.getRawValue();
    this.api.getBookingAvailability(carId, value.startDate ?? undefined, value.endDate ?? undefined).subscribe({
      next: () => {
        this.isError.set(false);
        this.actionStatus.set('Availability check completed.');
      },
      error: () => {
        this.isError.set(true);
        this.actionStatus.set('Could not verify availability now.');
      }
    });
  }

  protected saveCarChanges() {
    const currentCar = this.car();
    if (!currentCar || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSavingCar.set(true);
    this.editMessage.set('');
    this.editError.set(false);

    const completeSave = (imageUrl: string) => {
      const value = this.editForm.getRawValue();
      this.api
        .adminUpdateCar(currentCar.id, {
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
        })
        .subscribe({
          next: () => {
            this.isSavingCar.set(false);
            this.editMessage.set('Car updated successfully.');
            this.editError.set(false);
            this.reloadCar();
          },
          error: (error: unknown) => {
            this.isSavingCar.set(false);
            this.editError.set(true);
            this.editMessage.set(error instanceof Error ? error.message : 'Unable to update car now.');
          }
        });
    };

    const selectedFile = this.mainImageFile();
    if (selectedFile) {
      const formData = new FormData();
      formData.append('files', selectedFile, selectedFile.name);

      this.api.adminUploadCarImages(formData).subscribe({
        next: (response) => {
          const urls = this.extractUploadedUrls(response);
          const imageUrl = urls[0] ?? '';
          if (!imageUrl) {
            this.isSavingCar.set(false);
            this.editError.set(true);
            this.editMessage.set('Upload succeeded but no image URL was returned.');
            return;
          }

          completeSave(imageUrl);
        },
        error: (error: unknown) => {
          this.isSavingCar.set(false);
          this.editError.set(true);
          this.editMessage.set(error instanceof Error ? error.message : 'Unable to upload car image now.');
        }
      });
      return;
    }

    const imageUrl = this.mainImagePreview().trim() || currentCar.imageUrl;
    completeSave(imageUrl);
  }

  protected isBookingControlInvalid(controlName: 'fullName' | 'phoneNumber') {
    const control = this.bookingForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  private loadFavoriteState(carId: string) {
    this.api.getMyFavorites().subscribe({
      next: (payload: unknown) => {
        const collection = this.extractCollection(payload);
        if (collection.length === 0) {
          this.isFavorite.set(false);
          return;
        }

        const isFav = collection.some((item) => {
          if (typeof item !== 'object' || item === null) {
            return false;
          }

          const record = item as Record<string, unknown>;
          if (record['id'] === carId || record['carId'] === carId) {
            return true;
          }

          const nestedCar = record['car'];
          if (typeof nestedCar === 'object' && nestedCar !== null) {
            const carRecord = nestedCar as Record<string, unknown>;
            return carRecord['id'] === carId;
          }

          return false;
        });

        this.isFavorite.set(isFav);
      },
      error: () => this.isFavorite.set(false)
    });
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

  private loadWhatsAppLink(carId: string) {
    this.api.getWhatsAppLink(carId).subscribe({
      next: (payload: unknown) => {
        if (typeof payload === 'string') {
          this.waLink.set(payload);
          return;
        }

        if (typeof payload === 'object' && payload !== null) {
          const record = payload as Record<string, unknown>;
          const link = record['url'] ?? record['link'] ?? record['whatsAppUrl'];
          if (typeof link === 'string') {
            this.waLink.set(link);
          }
        }
      }
    });
  }

  private patchEditForm(car: Car) {
    this.editForm.patchValue({
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
      isAvailable: true
    });
    this.mainImageFile.set(null);
    this.mainImagePreview.set(car.imageUrl);
  }

  protected onAdminImageSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    this.mainImageFile.set(file);

    if (!file) {
      this.mainImagePreview.set(this.car()?.imageUrl ?? '');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      this.mainImagePreview.set(typeof result === 'string' ? result : '');
    };
    reader.readAsDataURL(file);
  }

  private extractUploadedUrls(payload: unknown): string[] {
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
}
