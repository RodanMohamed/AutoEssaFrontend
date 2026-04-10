import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CarsApi } from '../../cars/data-access/cars.api';
import { Car } from '../../cars/data-access/cars.interface';
import { HomeContentApi } from '../data-access/home-content.api';
import { HomeContent } from '../data-access/home-content.interface';
import { CarCardComponent } from '../../../shared/ui/car-card.component';
import { HeroSectionComponent } from '../ui/hero-section.component';
import { QuickSearchComponent } from '../ui/quick-search.component';

@Component({
  selector: 'app-landing-page',
  imports: [HeroSectionComponent, QuickSearchComponent, CarCardComponent],
  template: `
    <section class="space-y-8">
      <app-hero-section
        [title]="homeContent().heroHeadline"
        [subtitle]="homeContent().heroSubHeadline"
        [ctaText]="homeContent().heroCtaText"
      />

      <section class="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <article class="rounded-4xl border border-base-300 bg-base-100 shadow-lg">
          <div class="space-y-5 p-6 md:p-8">
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-serif text-2xl">{{ copy().whyChooseUsTitle }}</h3>
              <span class="badge badge-outline">{{ copy().trustBadge }}</span>
            </div>
            <p class="text-base-content/75">{{ homeContent().whyChooseUsText }}</p>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-base-300 bg-base-200/50 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().featureOneTitle }}</p>
                <p class="mt-2 font-medium">{{ copy().featureOneBody }}</p>
              </div>
              <div class="rounded-2xl border border-base-300 bg-base-200/50 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().featureTwoTitle }}</p>
                <p class="mt-2 font-medium">{{ copy().featureTwoBody }}</p>
              </div>
            </div>
          </div>
        </article>

        <div class="grid gap-5 md:grid-cols-2">
          <article class="rounded-4xl border border-base-300 bg-base-100 shadow-lg">
            <div class="space-y-4 p-6 md:p-8">
              <div class="flex items-center justify-between gap-3">
                <h3 class="font-serif text-2xl">{{ copy().categoriesTitle }}</h3>
                <span class="badge badge-outline">{{ copy().categoryBadge }}</span>
              </div>
              <p class="text-base-content/75">{{ copy().categoriesBody }}</p>
              <div class="space-y-3">
                <div class="rounded-2xl border border-base-300 bg-base-200/50 p-4">
                  <p class="font-semibold">{{ copy().rentCategoryTitle }}</p>
                  <p class="text-sm text-base-content/70">{{ copy().rentCategoryBody }}</p>
                </div>
                <div class="rounded-2xl border border-base-300 bg-base-200/50 p-4">
                  <p class="font-semibold">{{ copy().buyCategoryTitle }}</p>
                  <p class="text-sm text-base-content/70">{{ copy().buyCategoryBody }}</p>
                </div>
              </div>
            </div>
          </article>

          <article class="rounded-4xl border border-base-300 bg-base-100 shadow-lg">
            <div class="space-y-4 p-6 md:p-8">
              <div class="flex items-center justify-between gap-3">
                <h3 class="font-serif text-2xl">{{ copy().insightsTitle }}</h3>
                <span class="badge badge-outline">{{ copy().insightsBadge }}</span>
              </div>
              <p class="text-base-content/75">{{ copy().insightsBody }}</p>
              <div class="space-y-4">
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div class="rounded-2xl border border-base-300 bg-base-200/50 p-3 text-center">
                    <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().insightOneLabel }}</p>
                    <p class="mt-1 font-semibold">{{ copy().insightOneValue }}</p>
                  </div>
                  <div class="rounded-2xl border border-base-300 bg-base-200/50 p-3 text-center">
                    <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().insightTwoLabel }}</p>
                    <p class="mt-1 font-semibold">{{ copy().insightTwoValue }}</p>
                  </div>
                  <div class="rounded-2xl border border-base-300 bg-base-200/50 p-3 text-center">
                    <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().insightThreeLabel }}</p>
                    <p class="mt-1 font-semibold">{{ copy().insightThreeValue }}</p>
                  </div>
                </div>
                <div class="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                  <p class="font-semibold">{{ copy().insightsFootnoteTitle }}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="w-full rounded-3xl border border-base-300 bg-base-100/85 p-4 shadow-lg md:p-6">
        <app-quick-search (searchChanged)="onSearch($event)" />
      </section>

      <section id="featured" class="space-y-4">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <h2 class="font-serif text-3xl">{{ copy().featuredCarsTitle }}</h2>
    
        </div>
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (car of filteredCars(); track car.id) {
            <app-car-card [car]="car" />
          }
        </div>
      </section>

    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class LandingPage {
  private readonly carsApi = inject(CarsApi);
  private readonly homeContentApi = inject(HomeContentApi);
  private readonly route = inject(ActivatedRoute);

  protected readonly cars = signal<Car[]>([]);
  protected readonly homeContent = signal<HomeContent>({
    heroHeadline: 'Premium Cars for Rent and Sale',
    heroSubHeadline: 'Quick search, trusted listings, and direct WhatsApp booking in minutes.',
    heroCtaText: 'Browse Featured Cars',
    whyChooseUsText: 'Verified cars, transparent pricing, and responsive support.'
  });
  private readonly query = signal('');
  private readonly listingType = signal('all');
  protected readonly copy = computed(() => ({
    searchBadge: 'Quick Search',
    fastSearchBadge: 'Instant results',
    searchTitle: 'Find the right car faster',
    searchDescription: 'Use the search to narrow cars by name, type, rent, or buy mode.',
    searchStatOneLabel: 'Filter',
    searchStatOneValue: 'Focused',
    searchStatTwoLabel: 'Time',
    searchStatTwoValue: 'Lower',
    searchStatThreeLabel: 'Decision',
    searchStatThreeValue: 'Faster',
    whyChooseUsTitle: 'Why choose us',
    trustBadge: 'Trust',
    featureOneTitle: 'Transparency',
    featureOneBody: 'Clear specs and pricing without noise.',
    featureTwoTitle: 'Communication',
    featureTwoBody: 'Fast WhatsApp and phone response.',
    categoriesTitle: 'Categories',
    categoriesBody: 'Rent daily or monthly, or buy from curated listings.',
    categoryBadge: 'Browse',
    rentCategoryTitle: 'Rent',
    rentCategoryBody: 'Ideal for short trips or day-to-day use.',
    buyCategoryTitle: 'Buy',
    buyCategoryBody: 'Curated listings for cars available to purchase.',
    insightsTitle: 'Market Snapshot',
    insightsBadge: 'Today',
    insightsBody: 'A quick overview to help you decide faster before exploring full inventory.',
    insightOneLabel: 'Inventory',
    insightOneValue: 'Live',
    insightTwoLabel: 'Response',
    insightTwoValue: '< 15 min',
    insightThreeLabel: 'Coverage',
    insightThreeValue: 'Major cities',
    insightsFootnoteTitle: 'Hand-picked Experience',

    featuredCarsTitle: 'Latest Cars',

  }));

  protected readonly filteredCars = computed(() => {
    const text = this.query().trim().toLowerCase();
    const type = this.listingType();
    const hasFilters = text.length > 0 || type !== 'all';

    const matches = this.cars().filter((car) => {
      const matchesText = `${car.brand} ${car.model}`.toLowerCase().includes(text);
      const normalizedListingType = car.listingType.trim().toLowerCase();
      const matchesType =
        type === 'all' ||
        normalizedListingType === type.toLowerCase() ||
        (type === 'Sell' && normalizedListingType === 'sale') ||
        (type === 'Sale' && normalizedListingType === 'sell');
      return matchesText && matchesType;
    });

    return hasFilters ? matches : matches.slice(0, 6);
  });

  constructor() {
    const resolvedCars = this.route.snapshot.data['cars'] as Car[] | undefined;
    if (resolvedCars && resolvedCars.length > 0) {
      this.cars.set(resolvedCars);
    }

    this.carsApi.getCars().subscribe((cars) => this.cars.set(cars));
    this.homeContentApi.getHomeContent().subscribe((content) => this.homeContent.set(content));
  }

  protected onSearch(value: { query: string; listingType: string }) {
    this.query.set(value.query);
    this.listingType.set(value.listingType);
  }
}
