import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CarsApi } from '../../cars/data-access/cars.api';
import { Car } from '../../cars/data-access/cars.interface';
import { CarCardComponent } from '../../../shared/ui/car-card.component';
import { HeroSectionComponent } from '../ui/hero-section.component';
import { QuickSearchComponent } from '../ui/quick-search.component';

@Component({
  selector: 'app-landing-page',
  imports: [HeroSectionComponent, QuickSearchComponent, CarCardComponent],
  template: `
    <section class="space-y-8">
      <app-hero-section
        title="Premium Cars for Rent and Sale"
        subtitle="Quick search, trusted listings, and direct WhatsApp booking in minutes."
      />

      <app-quick-search (searchChanged)="onSearch($event)" />

      <section id="featured" class="space-y-4">
        <h2 class="font-serif text-3xl">Featured Cars</h2>
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (car of filteredCars(); track car.id) {
            <app-car-card [car]="car" />
          }
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-3">
        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title">Why choose us</h3>
            <p>Verified cars, transparent pricing, and responsive support.</p>
          </div>
        </article>
        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title">Categories</h3>
            <p>Rent daily or monthly, or buy from curated listings.</p>
          </div>
        </article>
        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title">Testimonials</h3>
            <p>Customers value our speed, transparency, and car quality.</p>
          </div>
        </article>
      </section>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class LandingPage {
  private readonly carsApi = inject(CarsApi);
  private readonly route = inject(ActivatedRoute);

  protected readonly cars = signal<Car[]>([]);
  private readonly query = signal('');
  private readonly listingType = signal('all');

  protected readonly filteredCars = computed(() => {
    const text = this.query().trim().toLowerCase();
    const type = this.listingType();

    return this.cars().filter((car) => {
      const matchesText = `${car.brand} ${car.model}`.toLowerCase().includes(text);
      const matchesType = type === 'all' || car.listingType === type;
      return matchesText && matchesType;
    });
  });

  constructor() {
    const resolvedCars = this.route.snapshot.data['cars'] as Car[] | undefined;
    if (resolvedCars && resolvedCars.length > 0) {
      this.cars.set(resolvedCars);
    }

    this.carsApi.getCars().subscribe((cars) => this.cars.set(cars));
  }

  protected onSearch(value: { query: string; listingType: string }) {
    this.query.set(value.query);
    this.listingType.set(value.listingType);
  }
}
