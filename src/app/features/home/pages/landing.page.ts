import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CarsApi } from '../../cars/data-access/cars.api';
import { Car } from '../../cars/data-access/cars.interface';
import { HomeContentApi } from '../data-access/home-content.api';
import { HomeContent, Testimonial } from '../data-access/home-content.interface';
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

      <section class="relative overflow-hidden rounded-4xl border border-base-300 bg-base-100 shadow-xl">
        <div class="absolute inset-0 bg-linear-to-br from-primary/10 via-base-100 to-secondary/10"></div>
        <div class="relative grid gap-6 p-6 md:p-8 xl:grid-cols-[1fr_0.9fr] xl:items-center">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge badge-primary badge-outline">{{ copy().searchBadge }}</span>
              <span class="badge badge-outline">{{ copy().fastSearchBadge }}</span>
            </div>
            <div class="space-y-2">
              <h2 class="font-serif text-3xl md:text-4xl">{{ copy().searchTitle }}</h2>
              <p class="max-w-2xl text-base-content/75">{{ copy().searchDescription }}</p>
            </div>
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-base-300 bg-base-100/90 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().searchStatOneLabel }}</p>
                <p class="mt-1 text-2xl font-semibold text-primary">{{ copy().searchStatOneValue }}</p>
              </div>
              <div class="rounded-2xl border border-base-300 bg-base-100/90 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().searchStatTwoLabel }}</p>
                <p class="mt-1 text-2xl font-semibold text-primary">{{ copy().searchStatTwoValue }}</p>
              </div>
              <div class="rounded-2xl border border-base-300 bg-base-100/90 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().searchStatThreeLabel }}</p>
                <p class="mt-1 text-2xl font-semibold text-primary">{{ copy().searchStatThreeValue }}</p>
              </div>
            </div>
          </div>

          <app-quick-search (searchChanged)="onSearch($event)" />
        </div>
      </section>

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

          <article class="rounded-4xl border border-base-300 bg-base-100 shadow-lg md:col-span-2 xl:col-span-1">
            <div class="space-y-4 p-6 md:p-8">
              <div class="flex items-center justify-between gap-3">
                <h3 class="font-serif text-2xl">{{ copy().testimonialsTitle }}</h3>
                <span class="badge badge-outline">{{ testimonials().length }} {{ copy().testimonialCountLabel }}</span>
              </div>
              <div class="space-y-3">
                @for (testimonial of testimonials(); track testimonial.id) {
                  <article class="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="font-semibold">{{ testimonial.customerName }}</p>
                        <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().reviewLabel }}</p>
                      </div>
                      <span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{{ testimonial.rating }}/5</span>
                    </div>
                    <p class="mt-3 text-sm text-base-content/75">{{ testimonial.comment }}</p>
                  </article>
                }
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="featured" class="space-y-4">
        <h2 class="font-serif text-3xl">{{ copy().featuredCarsTitle }}</h2>
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
  protected readonly testimonials = signal<Testimonial[]>([]);
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
    testimonialsTitle: 'Testimonials',
    testimonialCountLabel: 'reviews',
    reviewLabel: 'Trusted customer',
    featuredCarsTitle: 'Featured Cars'
  }));

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
    this.homeContentApi.getHomeContent().subscribe((content) => this.homeContent.set(content));
    this.homeContentApi.getTestimonials().subscribe((items) => this.testimonials.set(items));
  }

  protected onSearch(value: { query: string; listingType: string }) {
    this.query.set(value.query);
    this.listingType.set(value.listingType);
  }
}
