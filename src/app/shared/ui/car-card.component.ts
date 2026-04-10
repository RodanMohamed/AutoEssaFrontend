import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AutoessaApiService } from '../../core/services/autoessa-api.service';
import { AuthStore } from '../../features/auth/data-access/auth.store';
import { LocaleService } from '../../core/services/locale.service';
import { Car } from '../../features/cars/data-access/cars.interface';
import { UserService } from '../../features/user/data-access/user.service';

@Component({
  selector: 'app-car-card',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <article class="car-card card overflow-hidden border border-base-300 bg-base-100 shadow-lg">
      <figure class="relative">
        <img [src]="car().imageUrl" [alt]="car().brand + ' ' + car().model" class="h-52 w-full object-cover" />
        <button
          class="favorite-toggle btn btn-circle btn-sm absolute right-3 top-3"
          type="button"
          [disabled]="isUpdatingFavorite()"
          [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
          [title]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
          (click)="toggleFavorite()">
          <svg
            class="favorite-icon h-7 w-7"
            viewBox="0 0 62 62"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <circle cx="31" cy="31" r="30" [attr.stroke]="isFavorite() ? '#dc2626' : '#074D4D'" stroke-width="2" [attr.fill]="isFavorite() ? '#fee2e2' : 'none'" />
            <path
              d="M41.6066 32.7129L33.1211 41.1999C32.5585 41.7623 31.7956 42.0783 31.0001 42.0783C30.2046 42.0783 29.4416 41.7623 28.8791 41.1999L20.3936 32.7144C19.6921 32.0191 19.1349 31.1921 18.754 30.2808C18.373 29.3696 18.1758 28.392 18.1736 27.4044C18.1714 26.4167 18.3644 25.4383 18.7413 24.5254C19.1183 23.6125 19.6719 22.783 20.3703 22.0846C21.0687 21.3862 21.8981 20.8327 22.811 20.4557C23.724 20.0787 24.7023 19.8858 25.69 19.888C26.6777 19.8901 27.6552 20.0873 28.5665 20.4683C29.4777 20.8493 30.3047 21.4065 31.0001 22.1079C32.4124 20.7307 34.3105 19.9654 36.2831 19.9778C38.2557 19.9901 40.1441 20.7792 41.539 22.1739C42.934 23.5687 43.7233 25.457 43.736 27.4296C43.7486 29.4022 42.9836 31.3004 41.6066 32.7129Z"
              stroke="#dc2626"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              [attr.fill]="isFavorite() ? '#dc2626' : 'none'" />
          </svg>
        </button>
      </figure>
      <div class="card-body">
        <div class="flex items-start justify-between gap-2">
          <h3 class="card-title">{{ car().brand }} {{ car().model }}</h3>
          <span class="badge badge-primary badge-outline">{{ listingTypeLabel() }}</span>
        </div>
        <p class="text-sm text-base-content/70">{{ car().year }} . {{ car().transmissionType }} . {{ car().fuelType }}</p>
        <p class="text-lg font-semibold text-primary">{{ car().price | currency: 'EGP ' : 'symbol' : '1.0-0' }}</p>
        @if (favoriteMessage().length > 0) {
          <p class="text-xs" [class.text-error]="favoriteMessageIsError()" [class.text-success]="!favoriteMessageIsError()">{{ favoriteMessage() }}</p>
        }
        <div class="card-actions justify-end">
          <a class="btn btn-sm btn-outline" [routerLink]="['/cars', car().id]">{{ detailsLabel() }}</a>
        </div>
      </div>
    </article>
  `,
  styles: `
    .car-card {
      transition: transform 220ms ease, box-shadow 220ms ease;
    }

    .car-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 38px rgba(102, 69, 40, 0.23);
    }

    .car-card figure {
      position: relative;
      overflow: hidden;
    }

    .car-card figure::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 56%, rgba(40, 26, 12, 0.18) 100%);
      pointer-events: none;
    }

    .car-card img {
      transition: transform 300ms ease;
    }

    .car-card:hover img {
      transform: scale(1.03);
    }

    .favorite-toggle {
      z-index: 5;
      border: 1px solid rgba(255, 255, 255, 0.82);
      background: rgba(255, 255, 255, 0.95);
      color: #074d4d;
      padding: 0.15rem;
    }

    .favorite-icon {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarCardComponent {
  private readonly api = inject(AutoessaApiService);
  private readonly authStore = inject(AuthStore);
  private readonly localeService = inject(LocaleService);
  private readonly userService = inject(UserService);

  car = input.required<Car>();
  protected readonly isFavorite = signal(false);
  protected readonly isUpdatingFavorite = signal(false);
  protected readonly favoriteMessage = signal('');
  protected readonly favoriteMessageIsError = signal(false);

  constructor() {
    effect(() => {
      const carId = this.car().id;
      if (!carId) {
        this.isFavorite.set(false);
        return;
      }

      this.loadFavoriteState(String(carId));
    });
  }

  protected readonly listingTypeLabel = computed(() =>
    this.localeService.locale() === 'ar'
      ? this.car().listingType === 'Rent'
        ? 'إيجار'
        : 'شراء'
      : this.car().listingType
  );
  protected readonly detailsLabel = computed(() => (this.localeService.locale() === 'ar' ? 'التفاصيل' : 'Details'));

  protected toggleFavorite() {
    if (!this.authStore.isAuthenticated()) {
      this.favoriteMessageIsError.set(true);
      this.favoriteMessage.set('Please login first to use favorites.');
      return;
    }

    this.favoriteMessageIsError.set(false);
    const carId = String(this.car().id);
    this.favoriteMessage.set('');
    this.isUpdatingFavorite.set(true);

    const request$ = this.isFavorite() ? this.api.removeFavorite(carId) : this.api.addFavorite(carId);
    request$.subscribe({
      next: () => {
        this.isFavorite.set(!this.isFavorite());
        this.isUpdatingFavorite.set(false);
        this.favoriteMessageIsError.set(false);
        this.favoriteMessage.set(this.isFavorite() ? 'Added to favorites.' : 'Removed from favorites.' );
      },
      error: () => {
        this.isUpdatingFavorite.set(false);
        this.favoriteMessageIsError.set(true);
        this.favoriteMessage.set('Unable to update favorite right now.');
      }
    });
  }

  private loadFavoriteState(carId: string) {
    if (!this.authStore.isAuthenticated()) {
      this.isFavorite.set(false);
      return;
    }

    this.userService.getMyFavorites().subscribe({
      next: (payload: unknown) => {
        const favorites = this.userService.mapFavorites(payload);
        this.isFavorite.set(favorites.some((favorite) => String(favorite.id) === carId));
      },
      error: () => this.isFavorite.set(false)
    });
  }
}
