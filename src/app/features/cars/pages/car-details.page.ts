import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { CarsApi } from '../data-access/cars.api';
import { Car } from '../data-access/cars.interface';
import { AutoessaApiService } from '../../../core/services/autoessa-api.service';
import { LocaleService } from '../../../core/services/locale.service';

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
              <a mat-stroked-button href="tel:+201000000000">{{ copy().callButton }}</a>
              <button mat-stroked-button type="button" (click)="toggleFavorite()">
                {{ isFavorite() ? copy().removeFavorite : copy().addFavorite }}
              </button>
            </div>

            @if (actionStatus()) {
              <p class="text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">{{ actionStatus() }}</p>
            }
          </div>
        </article>

        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">{{ copy().bookingTitle }}</h2>
            <form [formGroup]="bookingForm" (ngSubmit)="submitBooking()" class="grid gap-3 md:grid-cols-2">
              <label class="form-control md:col-span-2">
                <span class="label-text">{{ copy().fullNameLabel }}</span>
                <input class="input input-bordered" formControlName="fullName" type="text" />
              </label>
              <label class="form-control md:col-span-2">
                <span class="label-text">{{ copy().phoneLabel }}</span>
                <input class="input input-bordered" formControlName="phoneNumber" type="text" />
              </label>
              <label class="form-control">
                <span class="label-text">{{ copy().startDateLabel }}</span>
                <input class="input input-bordered" formControlName="startDate" type="date" />
              </label>
              <label class="form-control">
                <span class="label-text">{{ copy().endDateLabel }}</span>
                <input class="input input-bordered" formControlName="endDate" type="date" />
              </label>
              <label class="form-control md:col-span-2">
                <span class="label-text">{{ copy().messageLabel }}</span>
                <textarea class="textarea textarea-bordered" formControlName="message" rows="3"></textarea>
              </label>
              <div class="md:col-span-2 flex gap-2">
                <button class="btn btn-primary" type="submit" [disabled]="bookingForm.invalid">{{ copy().sendRequestButton }}</button>
                <button class="btn btn-outline" type="button" (click)="checkAvailability()">{{ copy().availabilityButton }}</button>
              </div>
            </form>
          </div>
        </article>

        <article class="card border border-base-300 bg-base-100 shadow xl:col-span-2">
          <div class="card-body">
            <h2 class="card-title">{{ copy().reviewsTitle }}</h2>

            <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="grid gap-3 md:grid-cols-3">
              <label class="form-control">
                <span class="label-text">{{ copy().reviewNameLabel }}</span>
                <input class="input input-bordered" formControlName="fullName" type="text" />
              </label>
              <label class="form-control">
                <span class="label-text">{{ copy().ratingLabel }}</span>
                <input class="input input-bordered" formControlName="rating" type="number" min="1" max="5" />
              </label>
              <div class="flex items-end">
                <button class="btn btn-primary w-full" type="submit" [disabled]="reviewForm.invalid">{{ copy().submitReviewButton }}</button>
              </div>
              <label class="form-control md:col-span-3">
                <span class="label-text">{{ copy().commentLabel }}</span>
                <textarea class="textarea textarea-bordered" formControlName="comment" rows="3"></textarea>
              </label>
            </form>

            <div class="mt-4 grid gap-3">
              @for (review of reviews(); track $index) {
                <article class="rounded-xl border border-base-300 p-3">
                  <div class="flex items-center justify-between">
                    <p class="font-semibold">{{ review.fullName }}</p>
                    <p class="text-sm text-primary">{{ review.rating }}/5</p>
                  </div>
                  <p class="text-sm text-base-content/75">{{ review.comment }}</p>
                </article>
              }
            </div>
          </div>
        </article>
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

  protected readonly car = signal<Car | null>(null);
  protected readonly reviews = signal<Array<{ fullName: string; rating: number; comment: string }>>([]);
  protected readonly isFavorite = signal(false);
  protected readonly actionStatus = signal('');
  protected readonly isError = signal(false);
  protected readonly waLink = signal('');
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
          reviewsTitle: 'التقييمات',
          reviewNameLabel: 'الاسم',
          ratingLabel: 'التقييم',
          submitReviewButton: 'إرسال التقييم',
          commentLabel: 'التعليق'
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
          reviewsTitle: 'Reviews',
          reviewNameLabel: 'Name',
          ratingLabel: 'Rating',
          submitReviewButton: 'Submit Review',
          commentLabel: 'Comment'
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

  protected readonly reviewForm = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rating: new FormControl(5, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(5)] }),
    comment: new FormControl('', { nonNullable: true })
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.carsApi.getCarById(id).subscribe((car) => this.car.set(car));
    this.loadFavoriteState(id);
    this.loadReviews(id);
    this.loadWhatsAppLink(id);
  }

  protected whatsAppLink() {
    if (this.waLink()) {
      return this.waLink();
    }

    const selectedCar = this.car();
    const text = selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : 'this car';
    return `https://wa.me/201000000000?text=${encodeURIComponent(`Hi, I am interested in ${text}`)}`;
  }

  protected toggleFavorite() {
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
    if (!carId || this.bookingForm.invalid) {
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
        error: () => {
          this.isError.set(true);
          this.actionStatus.set('Unable to send booking request right now.');
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

  protected submitReview() {
    const carId = this.car()?.id;
    if (!carId || this.reviewForm.invalid) {
      return;
    }

    const value = this.reviewForm.getRawValue();
    this.api
      .createReview({
        carId,
        fullName: value.fullName,
        rating: value.rating,
        comment: value.comment || null
      })
      .subscribe({
        next: () => {
          this.isError.set(false);
          this.actionStatus.set('Review submitted.');
          this.reviewForm.reset({ fullName: '', rating: 5, comment: '' });
          this.loadReviews(carId);
        },
        error: () => {
          this.isError.set(true);
          this.actionStatus.set('Unable to submit review now.');
        }
      });
  }

  private loadFavoriteState(carId: string) {
    this.api.getMyFavorites().subscribe({
      next: (payload: unknown) => {
        if (!Array.isArray(payload)) {
          this.isFavorite.set(false);
          return;
        }

        const isFav = payload.some((item) => {
          if (typeof item !== 'object' || item === null) {
            return false;
          }

          const record = item as Record<string, unknown>;
          return record['id'] === carId || record['carId'] === carId;
        });

        this.isFavorite.set(isFav);
      },
      error: () => this.isFavorite.set(false)
    });
  }

  private loadReviews(carId: string) {
    this.api.getCarReviews(carId).subscribe({
      next: (payload: unknown) => {
        if (!Array.isArray(payload)) {
          this.reviews.set([]);
          return;
        }

        const mapped = payload.map((item) => {
          const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
          return {
            fullName: typeof record['fullName'] === 'string' ? record['fullName'] : 'Customer',
            rating: typeof record['rating'] === 'number' ? record['rating'] : 5,
            comment: typeof record['comment'] === 'string' ? record['comment'] : ''
          };
        });
        this.reviews.set(mapped);
      },
      error: () => this.reviews.set([])
    });
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
}
