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

          <article class="insights-panel relative overflow-hidden rounded-4xl border border-base-300 bg-base-100 shadow-lg">
            <div class="insights-glow insights-glow-one"></div>
            <div class="insights-glow insights-glow-two"></div>

            <div class="relative space-y-5 p-6 md:p-8">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-xs uppercase tracking-[0.22em] text-base-content/55">{{ copy().insightsBadge }}</p>
                  <h3 class="mt-2 font-serif text-2xl">{{ copy().insightsTitle }}</h3>
                </div>
                <span class="badge badge-outline">{{ copy().insightsFootnoteTitle }}</span>
              </div>

              <p class="max-w-xl text-base-content/75">{{ copy().insightsBody }}</p>

              <div class="grid gap-3 sm:grid-cols-3">
                <div class="insight-card rounded-2xl border border-base-300 bg-base-200/50 p-4 text-center" style="--delay: 0s;">
                  <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().insightOneLabel }}</p>
                  <p class="mt-2 text-2xl font-semibold">{{ copy().insightOneValue }}</p>
                </div>
                <div class="insight-card rounded-2xl border border-base-300 bg-base-200/50 p-4 text-center" style="--delay: 0.12s;">
                  <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().insightTwoLabel }}</p>
                  <p class="mt-2 text-2xl font-semibold">{{ copy().insightTwoValue }}</p>
                </div>
                <div class="insight-card rounded-2xl border border-base-300 bg-base-200/50 p-4 text-center" style="--delay: 0.24s;">
                  <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().insightThreeLabel }}</p>
                  <p class="mt-2 text-2xl font-semibold">{{ copy().insightThreeValue }}</p>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                <div class="insight-wave rounded-2xl border border-base-300 bg-base-200/40 p-4">
                  <p class="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/55">Live movement</p>
                  <div class="mt-4 flex items-end gap-2">
                    <span class="insight-bar h-10 w-3"></span>
                    <span class="insight-bar h-16 w-3"></span>
                    <span class="insight-bar h-12 w-3"></span>
                    <span class="insight-bar h-20 w-3"></span>
                    <span class="insight-bar h-14 w-3"></span>
                    <span class="insight-bar h-24 w-3"></span>
                  </div>
                </div>
                <div class="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                  <p class="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/55">Hand-picked experience</p>
                  
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
  styles: `
    .insights-panel {
      isolation: isolate;
    }

    .insights-glow {
      position: absolute;
      border-radius: 9999px;
      filter: blur(36px);
      opacity: 0.55;
      pointer-events: none;
      animation: insightsFloat 9s ease-in-out infinite;
    }

    .insights-glow-one {
      top: -2rem;
      right: -1rem;
      width: 9rem;
      height: 9rem;
      background: rgba(225, 160, 92, 0.2);
    }

    .insights-glow-two {
      bottom: -2rem;
      left: -1rem;
      width: 8rem;
      height: 8rem;
      background: rgba(163, 190, 140, 0.2);
      animation-delay: -3s;
    }

    .insight-card {
      animation: insightRise 720ms ease both;
      animation-delay: var(--delay);
    }

    .insight-wave {
      overflow: hidden;
    }

    .insight-bar {
      display: block;
      border-radius: 9999px 9999px 0 0;
      background: linear-gradient(180deg, rgba(80, 120, 90, 0.95), rgba(80, 120, 90, 0.35));
      transform-origin: bottom;
      animation: barPulse 2.4s ease-in-out infinite;
    }

    .insight-bar:nth-child(2) {
      animation-delay: 0.15s;
    }

    .insight-bar:nth-child(3) {
      animation-delay: 0.3s;
    }

    .insight-bar:nth-child(4) {
      animation-delay: 0.45s;
    }

    .insight-bar:nth-child(5) {
      animation-delay: 0.6s;
    }

    .insight-bar:nth-child(6) {
      animation-delay: 0.75s;
    }

    .insight-bar:nth-child(7) {
      animation-delay: 0.9s;
    }

    @keyframes insightRise {
      from {
        opacity: 0;
        transform: translateY(14px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes insightsFloat {
      0%,
      100% {
        transform: translateY(0) scale(1);
      }

      50% {
        transform: translateY(10px) scale(1.05);
      }
    }

    @keyframes barPulse {
      0%,
      100% {
        transform: scaleY(0.88);
      }

      50% {
        transform: scaleY(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .insights-glow,
      .insight-card,
      .insight-bar {
        animation: none !important;
      }
    }
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
