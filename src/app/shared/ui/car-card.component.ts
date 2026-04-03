import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Car } from '../../features/cars/data-access/cars.interface';

@Component({
  selector: 'app-car-card',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <article class="card overflow-hidden border border-base-300 bg-base-100 shadow-lg">
      <figure>
        <img [src]="car().imageUrl" [alt]="car().brand + ' ' + car().model" class="h-52 w-full object-cover" />
      </figure>
      <div class="card-body">
        <div class="flex items-start justify-between gap-2">
          <h3 class="card-title">{{ car().brand }} {{ car().model }}</h3>
          <span class="badge badge-primary badge-outline">{{ car().listingType }}</span>
        </div>
        <p class="text-sm text-base-content/70">{{ car().year }} . {{ car().transmissionType }} . {{ car().fuelType }}</p>
        <p class="text-lg font-semibold text-primary">{{ car().price | currency: 'EGP ' : 'symbol' : '1.0-0' }}</p>
        <div class="card-actions justify-end">
          <a class="btn btn-sm btn-outline" [routerLink]="['/cars', car().id]">Details</a>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarCardComponent {
  car = input.required<Car>();
}
