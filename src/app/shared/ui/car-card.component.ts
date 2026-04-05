import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocaleService } from '../../core/services/locale.service';
import { Car } from '../../features/cars/data-access/cars.interface';

@Component({
  selector: 'app-car-card',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <article class="car-card card overflow-hidden border border-base-300 bg-base-100 shadow-lg">
      <figure>
        <img [src]="car().imageUrl" [alt]="car().brand + ' ' + car().model" class="h-52 w-full object-cover" />
      </figure>
      <div class="card-body">
        <div class="flex items-start justify-between gap-2">
          <h3 class="card-title">{{ car().brand }} {{ car().model }}</h3>
          <span class="badge badge-primary badge-outline">{{ listingTypeLabel() }}</span>
        </div>
        <p class="text-sm text-base-content/70">{{ car().year }} . {{ car().transmissionType }} . {{ car().fuelType }}</p>
        <p class="text-lg font-semibold text-primary">{{ car().price | currency: 'EGP ' : 'symbol' : '1.0-0' }}</p>
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
  private readonly localeService = inject(LocaleService);

  car = input.required<Car>();
  protected readonly listingTypeLabel = computed(() =>
    this.localeService.locale() === 'ar'
      ? this.car().listingType === 'Rent'
        ? 'إيجار'
        : 'شراء'
      : this.car().listingType
  );
  protected readonly detailsLabel = computed(() => (this.localeService.locale() === 'ar' ? 'التفاصيل' : 'Details'));
}
