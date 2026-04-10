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

      <section class="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <article class="feature-panel feature-panel-why relative overflow-hidden rounded-4xl border border-base-300 bg-base-100 shadow-lg">
            <div class="feature-accent feature-accent-why"></div>
            <div class="relative space-y-6 p-6 md:p-8">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-xs uppercase tracking-[0.22em] text-base-content/55">{{ copy().trustBadge }}</p>
                  <h3 class="mt-2 font-serif text-2xl md:text-3xl">{{ copy().whyChooseUsTitle }}</h3>
                </div>
                <span class="badge badge-outline badge-lg">Verified</span>
              </div>

              <p class="max-w-2xl text-base-content/75 leading-7">{{ homeContent().whyChooseUsText }}</p>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="feature-tile rounded-3xl border border-base-300 bg-base-200/55 p-4 md:p-5">
                  <div class="flex items-start gap-3">
                    <span class="feature-number">01</span>
                    <div>
                      <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().featureOneTitle }}</p>
                      <p class="mt-2 font-medium leading-6">{{ copy().featureOneBody }}</p>
                    </div>
                  </div>
                </div>
                <div class="feature-tile rounded-3xl border border-base-300 bg-base-200/55 p-4 md:p-5">
                  <div class="flex items-start gap-3">
                    <span class="feature-number">02</span>
                    <div>
                      <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().featureTwoTitle }}</p>
                      <p class="mt-2 font-medium leading-6">{{ copy().featureTwoBody }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-3xl border border-base-300 bg-base-200/45 p-4 md:p-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <p class="font-semibold">Trusted support, polished listings, and quick response times.</p>
                  <span class="badge badge-outline">{{ homeContent().heroCtaText }}</span>
                </div>
              </div>
            </div>
          </article>

        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
          <article class="feature-panel feature-panel-categories relative overflow-hidden rounded-4xl border border-base-300 bg-base-100 shadow-lg">
            <div class="relative space-y-5 p-6 md:p-8">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-xs uppercase tracking-[0.22em] text-base-content/55">Browse</p>
                  <h3 class="mt-2 font-serif text-2xl md:text-3xl">{{ copy().categoriesTitle }}</h3>
                </div>
                <span class="badge badge-outline badge-lg">{{ copy().categoryBadge }}</span>
              </div>

              <p class="max-w-xl text-base-content/75 leading-7">{{ copy().categoriesBody }}</p>

              <div class="grid gap-3">
                <div class="category-card category-card-rent rounded-3xl border border-base-300 p-4 md:p-5">
                  <div class="flex items-start gap-4">
                    <span class="category-pill">R</span>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <p class="font-semibold text-lg">{{ copy().rentCategoryTitle }}</p>
                        <span class="badge badge-sm badge-outline">Flexible</span>
                      </div>
                      <p class="mt-2 text-sm leading-6 text-base-content/70">{{ copy().rentCategoryBody }}</p>
                    </div>
                  </div>
                </div>

                <div class="category-card category-card-buy rounded-3xl border border-base-300 p-4 md:p-5">
                  <div class="flex items-start gap-4">
                    <span class="category-pill">B</span>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <p class="font-semibold text-lg">{{ copy().buyCategoryTitle }}</p>
                        <span class="badge badge-sm badge-outline">Curated</span>
                      </div>
                      <p class="mt-2 text-sm leading-6 text-base-content/70">{{ copy().buyCategoryBody }}</p>
                    </div>
                  </div>
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
                  <p class="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/55">Curated Selection</p>
                  <div class="mt-3 space-y-2">
                    <style>
  @keyframes wave-flow {
    0% { d: path("M0,10 Q20,0 40,10 Q60,20 80,10 Q100,0 120,10 Q140,20 160,10"); }
    50% { d: path("M0,10 Q20,20 40,10 Q60,0 80,10 Q100,20 120,10 Q140,0 160,10"); }
    100% { d: path("M0,10 Q20,0 40,10 Q60,20 80,10 Q100,0 120,10 Q140,20 160,10"); }
  }
  @keyframes wave-move {
    0% { transform: translateX(0); }
    100% { transform: translateX(-80px); }
  }
  .wave-path {
    fill: none;
    stroke: #378ADD;
    stroke-width: 2;
    stroke-linecap: round;
    animation: wave-move 1.5s linear infinite;
  }
</style>

<svg width="160" height="20" viewBox="0 0 160 20" xmlns="http://www.w3.org/2000/svg" style="overflow: hidden; display: block;">
  <path class="wave-path"
    d="M-80,10 Q-60,2 -40,10 Q-20,18 0,10 Q20,2 40,10 Q60,18 80,10 Q100,2 120,10 Q140,18 160,10 Q180,2 200,10 Q220,18 240,10" />
</svg>
                  </div>
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

    .feature-panel {
      transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
    }

    .feature-panel:hover {
      transform: translateY(-2px);
      box-shadow: 0 22px 40px rgba(124, 80, 38, 0.12);
    }

    .feature-accent {
      position: absolute;
      inset-inline-end: 0;
      inset-block-start: 0;
      width: 9rem;
      height: 9rem;
      border-radius: 0 0 0 9999px;
      opacity: 0.12;
      pointer-events: none;
    }

    .feature-accent-why {
      background: linear-gradient(135deg, #b77d4b, #76a16d);
    }

    .feature-panel-categories {
      overflow: hidden;
    }

    .feature-panel-categories::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at top right, rgba(225, 160, 92, 0.12), transparent 32%),
        radial-gradient(circle at bottom left, rgba(118, 161, 109, 0.1), transparent 28%);
      pointer-events: none;
    }

    .feature-tile {
      transition: transform 200ms ease, background-color 200ms ease;
    }

    .feature-tile:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.72);
    }

    .feature-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 9999px;
      background: linear-gradient(135deg, rgba(183, 125, 75, 0.18), rgba(118, 161, 109, 0.18));
      color: #6e4b2d;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      flex-shrink: 0;
    }

    .category-card {
      position: relative;
      overflow: hidden;
      transition: transform 200ms ease, box-shadow 200ms ease;
    }

    .category-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 28px rgba(124, 80, 38, 0.1);
    }

    .category-card-rent {
      background: linear-gradient(135deg, rgba(255, 247, 236, 0.95), rgba(255, 255, 255, 0.92));
    }

    .category-card-buy {
      background: linear-gradient(135deg, rgba(241, 248, 238, 0.95), rgba(255, 255, 255, 0.92));
    }

    .category-card::after {
      content: '';
      position: absolute;
      inset-inline-end: -1.5rem;
      inset-block-start: -1.5rem;
      width: 5rem;
      height: 5rem;
      border-radius: 9999px;
      opacity: 0.18;
      pointer-events: none;
    }

    .category-card-rent::after {
      background: rgba(183, 125, 75, 0.9);
    }

    .category-card-buy::after {
      background: rgba(118, 161, 109, 0.9);
    }

    .category-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border-radius: 1rem;
      background: linear-gradient(135deg, rgba(183, 125, 75, 0.16), rgba(118, 161, 109, 0.16));
      font-size: 1rem;
      font-weight: 700;
      color: #5e3f24;
      flex-shrink: 0;
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
      transition: transform 200ms ease, box-shadow 200ms ease;
    }

    .insight-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 28px rgba(124, 80, 38, 0.08);
    }

    .insight-card-one {
      background: linear-gradient(180deg, rgba(255, 248, 239, 0.95), rgba(255, 255, 255, 0.9));
    }

    .insight-card-two {
      background: linear-gradient(180deg, rgba(241, 248, 238, 0.95), rgba(255, 255, 255, 0.9));
    }

    .insight-card-three {
      background: linear-gradient(180deg, rgba(244, 243, 255, 0.95), rgba(255, 255, 255, 0.9));
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
