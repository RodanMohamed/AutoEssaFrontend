import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { CarsApi } from '../data-access/cars.api';
import { Car } from '../data-access/cars.interface';

@Component({
  selector: 'app-car-details-page',
  imports: [CurrencyPipe, DecimalPipe, MatButtonModule],
  template: `
    @if (car()) {
      <section class="grid gap-6 lg:grid-cols-2">
        <img [src]="car()!.imageUrl" [alt]="car()!.brand + ' ' + car()!.model" class="h-full min-h-80 w-full rounded-2xl object-cover" />

        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body">
            <h1 class="font-serif text-3xl">{{ car()!.brand }} {{ car()!.model }}</h1>
            <p class="text-base-content/70">{{ car()!.year }} . {{ car()!.location }}</p>

            <div class="grid gap-2 rounded-xl bg-base-200/70 p-4 text-sm">
              <p>Transmission: {{ car()!.transmissionType }}</p>
              <p>Fuel: {{ car()!.fuelType }}</p>
              <p>Mileage: {{ car()!.mileage | number }} km</p>
              <p>Type: {{ car()!.listingType }}</p>
            </div>

            <p class="text-2xl font-semibold text-primary">{{ car()!.price | currency: 'EGP ' : 'symbol' : '1.0-0' }}</p>

            <div class="flex flex-wrap gap-3">
              <a mat-flat-button color="primary" [href]="whatsAppLink()" target="_blank" rel="noopener">Book via WhatsApp</a>
              <a mat-stroked-button href="tel:+201000000000">Call now</a>
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

  protected readonly car = signal<Car | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.carsApi.getCarById(id).subscribe((car) => this.car.set(car));
  }

  protected whatsAppLink() {
    const selectedCar = this.car();
    const text = selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : 'this car';
    return `https://wa.me/201000000000?text=${encodeURIComponent(`Hi, I am interested in ${text}`)}`;
  }
}
