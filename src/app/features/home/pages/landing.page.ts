import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LocaleService } from '../../../core/services/locale.service';
import { CarsApi } from '../../cars/data-access/cars.api';
import { Car } from '../../cars/data-access/cars.interface';
import { HomeContentApi } from '../data-access/home-content.api';
import { HomeContent } from '../data-access/home-content.interface';
import { CarCardComponent } from '../../../shared/ui/car-card.component';
import { HeroSectionComponent } from '../ui/hero-section.component';
import { QuickSearchComponent } from '../ui/quick-search.component';

const EN_COPY = {
  heroKicker: 'Premium Car Marketplace',
  verifiedBadge: 'Verified',
  trustedSupportText: 'Trusted support, polished listings, and quick response times.',
  browseLabel: 'Browse',
  flexibleBadge: 'Flexible',
  curatedBadge: 'Curated',
  liveMovementTitle: 'Live movement',
  curatedSelectionTitle: 'Curated Selection',
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
  featureThreeTitle: 'Verification',
  featureThreeBody: 'Every car verified for authentic specs and condition.',
  featureFourTitle: 'Flexibility',
  featureFourBody: 'Choose your terms: rent, lease, or buy with ease.',
  featureFiveTitle: 'Expert Guidance',
  featureFiveBody: 'Professional advice on vehicle selection and best deals.',
  featureSixTitle: 'Easy Booking',
  featureSixBody: 'Streamlined process from discovery to purchase.',
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
  featuredCarsTitle: 'Latest Cars'
};

const AR_COPY: typeof EN_COPY = {
  heroKicker: 'سوق السيارات الفاخرة',
  verifiedBadge: 'موثّق',
  trustedSupportText: 'دعم موثوق، عروض مرتبة، واستجابة سريعة.',
  browseLabel: 'تصفح',
  flexibleBadge: 'مرن',
  curatedBadge: 'مختار بعناية',
  liveMovementTitle: 'حركة مباشرة',
  curatedSelectionTitle: 'اختيارات منتقاة',
  searchBadge: 'بحث سريع',
  fastSearchBadge: 'نتائج فورية',
  searchTitle: 'اعثر على السيارة المناسبة بسرعة',
  searchDescription: 'استخدم البحث لتصفية السيارات بالاسم أو النوع أو وضع الإيجار والشراء.',
  searchStatOneLabel: 'التصفية',
  searchStatOneValue: 'أدق',
  searchStatTwoLabel: 'الوقت',
  searchStatTwoValue: 'أقل',
  searchStatThreeLabel: 'القرار',
  searchStatThreeValue: 'أسرع',
  whyChooseUsTitle: 'لماذا تختارنا',
  trustBadge: 'ثقة',
  featureOneTitle: 'شفافية',
  featureOneBody: 'مواصفات وأسعار واضحة بدون تعقيد.',
  featureTwoTitle: 'تواصل',
  featureTwoBody: 'استجابة سريعة عبر واتساب والهاتف.',
  featureThreeTitle: 'التحقق',
  featureThreeBody: 'كل سيارة موثقة للمواصفات والحالة الأصلية.',
  featureFourTitle: 'المرونة',
  featureFourBody: 'اختر شروطك: إيجار أو عقد أو شراء بسهولة.',
  featureFiveTitle: 'التوجيه المهني',
  featureFiveBody: 'نصيحة مهنية لاختيار المركبة والحصول على أفضل الصفقات.',
  featureSixTitle: 'الحجز السهل',
  featureSixBody: 'عملية مبسطة من الاكتشاف إلى الشراء.',
  categoriesTitle: 'الفئات',
  categoriesBody: 'استأجر يوميًا أو شهريًا، أو اشترِ من عروض مختارة.',
  categoryBadge: 'تصفح',
  rentCategoryTitle: 'إيجار',
  rentCategoryBody: 'مثالي للرحلات القصيرة أو الاستخدام اليومي.',
  buyCategoryTitle: 'شراء',
  buyCategoryBody: 'عروض منتقاة لسيارات متاحة للشراء.',
  insightsTitle: 'لمحة السوق',
  insightsBadge: 'اليوم',
  insightsBody: 'نظرة سريعة تساعدك على اتخاذ القرار قبل استعراض كامل المخزون.',
  insightOneLabel: 'المخزون',
  insightOneValue: 'مباشر',
  insightTwoLabel: 'الاستجابة',
  insightTwoValue: 'أقل من 15 دقيقة',
  insightThreeLabel: 'التغطية',
  insightThreeValue: 'المدن الرئيسية',
  insightsFootnoteTitle: 'تجربة منتقاة بعناية',
  featuredCarsTitle: 'أحدث السيارات'
};

@Component({
  selector: 'app-landing-page',
  imports: [HeroSectionComponent, QuickSearchComponent, CarCardComponent],
  template: `
    <section class="space-y-8">
      <app-hero-section
        [kicker]="copy().heroKicker"
        [title]="localizedHomeContent().heroHeadline"
        [subtitle]="localizedHomeContent().heroSubHeadline"
        [ctaText]="localizedHomeContent().heroCtaText"
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
                <span class="badge badge-outline badge-lg">{{ copy().verifiedBadge }}</span>
              </div>

              <p class="max-w-2xl text-base-content/75 leading-7">{{ localizedHomeContent().whyChooseUsText }}</p>

              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
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
                <div class="feature-tile hidden xl:flex rounded-3xl border border-base-300 bg-base-200/55 p-4 md:p-5">
                  <div class="flex items-start gap-3">
                    <span class="feature-number">03</span>
                    <div>
                      <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().featureThreeTitle }}</p>
                      <p class="mt-2 font-medium leading-6">{{ copy().featureThreeBody }}</p>
                    </div>
                  </div>
                </div>
                <div class="feature-tile hidden xl:flex rounded-3xl border border-base-300 bg-base-200/55 p-4 md:p-5">
                  <div class="flex items-start gap-3">
                    <span class="feature-number">04</span>
                    <div>
                      <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().featureFourTitle }}</p>
                      <p class="mt-2 font-medium leading-6">{{ copy().featureFourBody }}</p>
                    </div>
                  </div>
                </div>
                <div class="feature-tile hidden xl:flex rounded-3xl border border-base-300 bg-base-200/55 p-4 md:p-5">
                  <div class="flex items-start gap-3">
                    <span class="feature-number">05</span>
                    <div>
                      <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().featureFiveTitle }}</p>
                      <p class="mt-2 font-medium leading-6">{{ copy().featureFiveBody }}</p>
                    </div>
                  </div>
                </div>
                <div class="feature-tile hidden xl:flex rounded-3xl border border-base-300 bg-base-200/55 p-4 md:p-5">
                  <div class="flex items-start gap-3">
                    <span class="feature-number">06</span>
                    <div>
                      <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">{{ copy().featureSixTitle }}</p>
                      <p class="mt-2 font-medium leading-6">{{ copy().featureSixBody }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-3xl border border-base-300 bg-base-200/45 p-4 md:p-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <p class="font-semibold">{{ copy().trustedSupportText }}</p>
                  <span class="badge badge-outline">{{ localizedHomeContent().heroCtaText }}</span>
                </div>
              </div>
            </div>
          </article>

        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
          <article class="feature-panel feature-panel-categories relative overflow-hidden rounded-4xl border border-base-300 bg-base-100 shadow-lg">
            <div class="relative space-y-5 p-6 md:p-8">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-xs uppercase tracking-[0.22em] text-base-content/55">{{ copy().browseLabel }}</p>
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
                        <span class="badge badge-sm badge-outline">{{ copy().flexibleBadge }}</span>
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
                        <span class="badge badge-sm badge-outline">{{ copy().curatedBadge }}</span>
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
                <span class="badge badge-outline " style="max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block;">{{ copy().insightsFootnoteTitle }}</span>
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
                  <p class="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/55">{{ copy().liveMovementTitle }}</p>
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
                  <p class="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/55">{{ copy().curatedSelectionTitle }}</p>
                  <div class="mt-3 space-y-2">
                    <style>
  @keyframes curated-wave-flow-1 {
    0% {
      d: path("M0,12 Q20,5 40,12 Q60,18 80,12 Q100,6 120,12 Q140,18 160,12");
      opacity: 0.8;
    }
    50% {
      d: path("M0,8 Q20,12 40,8 Q60,4 80,8 Q100,14 120,8 Q140,2 160,8");
      opacity: 1;
    }
    100% {
      d: path("M0,12 Q20,5 40,12 Q60,18 80,12 Q100,6 120,12 Q140,18 160,12");
      opacity: 0.8;
    }
  }

  @keyframes curated-wave-flow-2 {
    0% {
      d: path("M0,8 Q20,14 40,8 Q60,2 80,8 Q100,15 120,8 Q140,1 160,8");
      opacity: 0.5;
      transform: translateX(0);
    }
    50% {
      d: path("M0,14 Q20,8 40,14 Q60,20 80,14 Q100,8 120,14 Q140,20 160,14");
      opacity: 0.7;
      transform: translateX(-40px);
    }
    100% {
      d: path("M0,8 Q20,14 40,8 Q60,2 80,8 Q100,15 120,8 Q140,1 160,8");
      opacity: 0.5;
      transform: translateX(0);
    }
  }

  @keyframes curated-wave-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }

  .wave-path {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 0 2px rgba(55, 138, 221, 0.3));
  }

  .wave-path-primary {
    stroke: #378ADD;
    animation: curated-wave-flow-1 3.5s ease-in-out infinite;
  }

  .wave-path-secondary {
    stroke: #378ADD;
    opacity: 0.5;
    animation: curated-wave-flow-2 4.2s ease-in-out infinite;
  }

  .curated-svg-container {
    animation: curated-wave-float 2.8s ease-in-out infinite;
    filter: drop-shadow(0 0 4px rgba(55, 138, 221, 0.2));
  }
</style>

<svg width="160" height="20" viewBox="0 0 160 20" xmlns="http://www.w3.org/2000/svg" style="overflow: hidden; display: block;" class="curated-svg-container">
  <defs>
    <filter id="soft-glow">
      <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <path class="wave-path wave-path-primary"
    d="M0,12 Q20,5 40,12 Q60,18 80,12 Q100,6 120,12 Q140,18 160,12" />
  <path class="wave-path wave-path-secondary"
    d="M0,8 Q20,14 40,8 Q60,2 80,8 Q100,15 120,8 Q140,1 160,8" />
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
  private readonly localeService = inject(LocaleService);

  protected readonly cars = signal<Car[]>([]);
  protected readonly homeContent = signal<HomeContent>({
    heroHeadline: 'Premium Cars for Rent and Sale',
    heroSubHeadline: 'Quick search, trusted listings, and direct WhatsApp booking in minutes.',
    heroCtaText: 'Browse Featured Cars',
    whyChooseUsText: 'Verified cars, transparent pricing, and responsive support.'
  });
  private readonly localizationMap = signal<Record<string, string>>({});
  private readonly query = signal('');
  private readonly listingType = signal('all');
  protected readonly copy = computed(() => (this.localeService.locale() === 'ar' ? AR_COPY : EN_COPY));

  protected readonly localizedHomeContent = computed(() => {
    const content = this.homeContent();
    if (this.localeService.locale() !== 'ar') {
      return {
        heroHeadline: content.heroHeadline,
        heroSubHeadline: content.heroSubHeadline,
        heroCtaText: content.heroCtaText,
        whyChooseUsText: content.whyChooseUsText
      };
    }

    return {
      heroHeadline: this.resolveArabicValue('heroHeadline', content.heroHeadline, content.heroHeadlineAr),
      heroSubHeadline: this.resolveArabicValue('heroSubHeadline', content.heroSubHeadline, content.heroSubHeadlineAr),
      heroCtaText: this.resolveArabicValue('heroCtaText', content.heroCtaText, content.heroCtaTextAr),
      whyChooseUsText: this.resolveArabicValue('whyChooseUsText', content.whyChooseUsText, content.whyChooseUsTextAr)
    };
  });

  protected readonly filteredCars = computed(() => {
    const text = this.query().trim().toLowerCase();
    const type = this.listingType().trim().toLowerCase();
    const hasFilters = text.length > 0 || type !== 'all';

    const matches = this.cars().filter((car) => {
      const searchableText = `${car.name} ${car.brand} ${car.model} ${car.carType} ${car.listingType}`.toLowerCase();
      const matchesText = searchableText.includes(text);
      const normalizedListingType = car.listingType.trim().toLowerCase();
      const matchesType =
        type === 'all' ||
        normalizedListingType === type ||
        (type === 'buy' && (normalizedListingType === 'sell' || normalizedListingType === 'sale')) ||
        ((type === 'sell' || type === 'sale') && normalizedListingType === 'buy');
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
    this.homeContentApi.getLocalizationSettings().subscribe((settings) => {
      const map: Record<string, string> = {};
      for (const setting of settings) {
        map[setting.key.toLowerCase()] = setting.value;
      }
      this.localizationMap.set(map);
    });
  }

  protected onSearch(value: { query: string; listingType: string }) {
    this.query.set(value.query.trim());
    this.listingType.set(value.listingType.trim());
  }

  private resolveArabicValue(fieldName: string, englishFallback: string, inlineArabic?: string): string {
    if (typeof inlineArabic === 'string' && inlineArabic.trim().length > 0) {
      return inlineArabic;
    }

    const map = this.localizationMap();
    const candidates = [
      `${fieldName}Ar`,
      `${fieldName}_ar`,
      `home.${fieldName}.ar`,
      `homepage.${fieldName}.ar`,
      `homePage.${fieldName}.ar`,
      `homepage_${fieldName}_ar`
    ];

    for (const key of candidates) {
      const value = map[key.toLowerCase()];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    return englishFallback;
  }
}
