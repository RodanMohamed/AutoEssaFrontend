import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { LocaleService } from '../../../core/services/locale.service';

@Component({
  selector: 'app-about-page',
  template: `
    <section class="space-y-6">
      <article class="card overflow-hidden border border-base-300 bg-base-100 shadow-xl">
        <div class="bg-linear-to-br from-primary/15 via-base-100 to-secondary/15 p-6 md:p-10">
          <div class="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
            <div class="space-y-4">
              <span class="badge badge-primary badge-outline">{{ copy().eyebrow }}</span>
              <h1 class="font-serif text-4xl leading-tight md:text-5xl">{{ copy().title }}</h1>
              <p class="max-w-2xl text-base-content/75">{{ copy().paragraphOne }}</p>
            </div>

            <div class="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div class="rounded-2xl border border-base-300 bg-base-100/80 p-4">
                <p class="text-xs uppercase tracking-[0.2em] text-base-content/60">{{ copy().statOneLabel }}</p>
                <p class="mt-1 text-2xl font-semibold text-primary">{{ copy().statOneValue }}</p>
              </div>
              <div class="rounded-2xl border border-base-300 bg-base-100/80 p-4">
                <p class="text-xs uppercase tracking-[0.2em] text-base-content/60">{{ copy().statTwoLabel }}</p>
                <p class="mt-1 text-2xl font-semibold text-primary">{{ copy().statTwoValue }}</p>
              </div>
              <div class="rounded-2xl border border-base-300 bg-base-100/80 p-4">
                <p class="text-xs uppercase tracking-[0.2em] text-base-content/60">{{ copy().statThreeLabel }}</p>
                <p class="mt-1 text-2xl font-semibold text-primary">{{ copy().statThreeValue }}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <section class="grid gap-4 lg:grid-cols-2">
        <article class="card border border-base-300 bg-base-100 shadow">
          <div class="card-body space-y-3">
            <h2 class="card-title">{{ copy().missionTitle }}</h2>
            <p>{{ copy().paragraphTwo }}</p>
          </div>
        </article>

        <article class="card border border-base-300 bg-base-100 shadow">
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
