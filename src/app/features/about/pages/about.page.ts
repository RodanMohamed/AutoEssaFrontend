import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { LocaleService } from '../../../core/services/locale.service';

@Component({
  selector: 'app-about-page',
  template: `
    <section class="space-y-6">
      <article class="about-hero card overflow-hidden border border-base-300 bg-base-100 shadow-xl">
        <div class="about-hero-surface p-6 md:p-10">
          <div class="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
            <div class="space-y-4">
              <span class="badge badge-primary badge-outline about-badge">{{ copy().eyebrow }}</span>
              <h1 class="about-title font-serif text-4xl leading-tight md:text-5xl">{{ copy().title }}</h1>
              <p class="about-body max-w-2xl text-base-content/75">{{ copy().paragraphOne }}</p>
            </div>

            <div class="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div class="about-stat rounded-2xl border border-base-300 bg-base-100/80 p-4">
                <p class="text-xs uppercase tracking-[0.2em] text-base-content/60">{{ copy().statOneLabel }}</p>
                <p class="mt-1 text-2xl font-semibold text-primary">{{ copy().statOneValue }}</p>
              </div>
              <div class="about-stat rounded-2xl border border-base-300 bg-base-100/80 p-4">
                <p class="text-xs uppercase tracking-[0.2em] text-base-content/60">{{ copy().statTwoLabel }}</p>
                <p class="mt-1 text-2xl font-semibold text-primary">{{ copy().statTwoValue }}</p>
              </div>
              <div class="about-stat rounded-2xl border border-base-300 bg-base-100/80 p-4">
                <p class="text-xs uppercase tracking-[0.2em] text-base-content/60">{{ copy().statThreeLabel }}</p>
                <p class="mt-1 text-2xl font-semibold text-primary">{{ copy().statThreeValue }}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <section class="grid gap-4 lg:grid-cols-2">
        <article class="about-info card border border-base-300 bg-base-100 shadow">
          <div class="card-body space-y-3">
            <h2 class="card-title">{{ copy().missionTitle }}</h2>
            <p>{{ copy().paragraphTwo }}</p>
          </div>
        </article>

        <article class="about-info card border border-base-300 bg-base-100 shadow">
          <div class="card-body space-y-3">
            <h2 class="card-title">{{ copy().trustTitle }}</h2>
            <ul class="space-y-2 text-sm text-base-content/80">
              <li>• {{ copy().trustOne }}</li>
              <li>• {{ copy().trustTwo }}</li>
              <li>• {{ copy().trustThree }}</li>
            </ul>
          </div>
        </article>
      </section>
    </section>
  `,
  styles: `
    .about-hero {
      border-color: #d4b28d;
      box-shadow: 0 28px 58px rgba(124, 80, 45, 0.21);
    }

    .about-hero-surface {
      background:
        radial-gradient(circle at 14% 18%, rgba(255, 248, 238, 0.84), transparent 40%),
        radial-gradient(circle at 86% 84%, rgba(199, 148, 97, 0.2), transparent 44%),
        linear-gradient(150deg, rgba(252, 245, 235, 0.98) 0%, rgba(243, 225, 203, 0.98) 56%, rgba(233, 206, 176, 0.95) 100%);
    }

    .about-badge {
      border-color: #c99d71;
      color: #885f38;
      background: rgba(255, 250, 242, 0.9);
    }

    .about-title {
      color: #573720;
    }

    .about-body {
      color: #6c4b30;
      line-height: 1.75;
    }

    .about-stat {
      border-color: #d8b792;
      background: linear-gradient(180deg, rgba(255, 251, 245, 0.93) 0%, rgba(247, 234, 217, 0.93) 100%);
    }

    .about-info {
      border-color: #d7b996;
      background: linear-gradient(180deg, rgba(255, 251, 245, 0.96) 0%, rgba(247, 236, 222, 0.96) 100%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AboutPage {
  private readonly localeService = inject(LocaleService);

  protected readonly copy = computed(() =>
    this.localeService.locale() === 'ar'
      ? {
          eyebrow: 'منصة سيارات موثوقة',
          title: 'عن Auto Essa',
          paragraphOne:
            'تم تصميم Auto Essa لتبسيط طريقة استئجار أو شراء السيارات في مصر. نركز على الثقة، والمعلومات الواضحة، وسرعة التواصل.',
          paragraphTwo:
            'مهمتنا هي تحويل التصفح إلى قرار واثق من خلال المواصفات الواضحة، والأسعار الصادقة، والدعم السريع.'
          ,
          missionTitle: 'المهمة والرؤية',
          trustTitle: 'لماذا يثق بنا العملاء',
          trustOne: 'قوائم واضحة ومحدثة باستمرار.',
          trustTwo: 'تواصل سريع عبر واتساب والهاتف.',
          trustThree: 'تركيز على التحويل إلى طلبات فعلية بدل المراسلات الطويلة.',
          statOneLabel: 'سيارات',
          statOneValue: 'مميزة',
          statTwoLabel: 'خدمة',
          statTwoValue: 'سريعة',
          statThreeLabel: 'تجربة',
          statThreeValue: 'موثوقة'
        }
      : {
          eyebrow: 'Trusted car marketplace',
          title: 'About Auto Essa',
          paragraphOne:
            'Auto Essa was built to simplify how customers in Egypt rent or buy cars. We focus on trust, transparent information, and fast communication.',
          paragraphTwo:
            'Our mission is to convert browsing into confident decisions through clear specs, honest pricing, and responsive support.'
          ,
          missionTitle: 'Mission and vision',
          trustTitle: 'Why customers trust us',
          trustOne: 'Clear, up-to-date listings.',
          trustTwo: 'Fast contact through WhatsApp and phone.',
          trustThree: 'Focused on turning browsing into real leads.',
          statOneLabel: 'Cars',
          statOneValue: 'Featured',
          statTwoLabel: 'Support',
          statTwoValue: 'Fast',
          statThreeLabel: 'Experience',
          statThreeValue: 'Trusted'
        }
  );
}
