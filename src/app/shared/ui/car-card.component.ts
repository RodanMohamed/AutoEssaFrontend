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
          class="btn btn-circle btn-sm absolute right-3 top-3 border-[#c89261] bg-base-100/10 text-[#c89261] shadow-md hover:border-[#ae7545] hover:bg-[#c89261] hover:text-base-100"
          type="button"
          [class.border-error]="isFavorite()"
          [class.bg-error]="isFavorite()"
          [class.text-base-100]="isFavorite()"
          [disabled]="isUpdatingFavorite()"
          [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
          [title]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
          (click)="toggleFavorite()">
          <svg
            class="h-5 w-5 transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            [class.text-error]="isFavorite()"
            [class.fill-current]="isFavorite()">
            <path d="M12 21s-7.2-4.35-9.54-8.15A5.75 5.75 0 0 1 12 5.57a5.75 5.75 0 0 1 9.54 7.28C19.2 16.65 12 21 12 21z" />
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
          <p class="text-xs text-base-content/70">{{ favoriteMessage() }}</p>
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
      this.favoriteMessage.set('Please login first to use favorites.');
      return;
    }

    const carId = String(this.car().id);
    this.favoriteMessage.set('');
    this.isUpdatingFavorite.set(true);

    const request$ = this.isFavorite() ? this.api.removeFavorite(carId) : this.api.addFavorite(carId);
    request$.subscribe({
      next: () => {
        this.isFavorite.set(!this.isFavorite());
        this.isUpdatingFavorite.set(false);
        this.favoriteMessage.set(this.isFavorite() ? 'Added to favorites.' : 'Removed from favorites.' );
      },
      error: () => {
        this.isUpdatingFavorite.set(false);
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
