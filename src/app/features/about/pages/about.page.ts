import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { LocaleService } from '../../../core/services/locale.service';

@Component({
  selector: 'app-about-page',
  template: `
    <section class="about-shell space-y-8 md:space-y-10">
      <article class="about-hero overflow-hidden rounded-4xl border border-base-300 shadow-[0_30px_70px_rgba(124,80,45,0.18)]">
        <div class="about-hero-surface relative p-6 md:p-10 lg:p-12">
          <div class="hero-orb hero-orb-a"></div>
          <div class="hero-orb hero-orb-b"></div>

          <div class="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div class="space-y-5">
              <span class="badge badge-outline about-kicker">{{ copy().eyebrow }}</span>
              <div class="space-y-3">
                <h1 class="about-title font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">{{ copy().title }}</h1>
                <p class="about-body max-w-2xl text-base md:text-lg">{{ copy().paragraphOne }}</p>
              </div>

              <div class="flex flex-wrap gap-3">
                <span class="about-pill">{{ copy().pillOne }}</span>
                <span class="about-pill">{{ copy().pillTwo }}</span>
                <span class="about-pill">{{ copy().pillThree }}</span>
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                @for (stat of copy().stats; track stat.label) {
                  <div class="stat-card rounded-2xl border border-base-300 bg-base-100/85 p-4 shadow-sm backdrop-blur-sm">
                    <p class="text-[0.7rem] uppercase tracking-[0.22em] text-base-content/55">{{ stat.label }}</p>
                    <p class="mt-1 text-xl font-semibold text-primary md:text-2xl">{{ stat.value }}</p>
                  </div>
                }
              </div>
            </div>

            <div class="rounded-[1.75rem] border border-base-200 bg-base-100/90 p-5 shadow-xl backdrop-blur-sm md:p-6">
              <div class="space-y-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs uppercase tracking-[0.28em] text-base-content/45">{{ copy().missionLabel }}</p>
                    <h2 class="mt-2 text-2xl font-semibold text-base-content">{{ copy().missionTitle }}</h2>
                  </div>
                  <div class="rounded-2xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">{{ copy().trustScore }}</div>
                </div>

                <p class="text-sm leading-7 text-base-content/75">{{ copy().paragraphTwo }}</p>

                <div class="space-y-3">
                  @for (item of copy().highlights; track item.title) {
                    <div class="flex gap-3 rounded-2xl border border-base-200 bg-base-100 p-4">
                      <div class="mt-0.5 h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-center text-lg leading-10 text-primary">{{ item.icon }}</div>
                      <div>
                        <p class="font-semibold text-base-content">{{ item.title }}</p>
                        <p class="text-sm leading-6 text-base-content/70">{{ item.body }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <section class="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1fr_0.9fr]">
        <article class="feature-card card border border-base-300 bg-base-100 shadow-lg">
          <div class="card-body space-y-4 p-6 md:p-8">
            <div class="section-heading">
              <p class="section-label">{{ copy().missionLabel }}</p>
              <h2 class="card-title text-2xl md:text-3xl">{{ copy().missionTitle }}</h2>
            </div>

            <p class="feature-copy">{{ copy().paragraphTwo }}</p>

            <div class="grid gap-3 sm:grid-cols-2">
              @for (step of copy().processSteps; track step.title) {
                <div class="step-card rounded-2xl border border-base-200 p-4">
                  <div class="flex items-center gap-3">
                    <div class="step-number">{{ step.index }}</div>
                    <h3 class="font-semibold text-base-content">{{ step.title }}</h3>
                  </div>
                  <p class="mt-3 text-sm leading-6 text-base-content/70">{{ step.body }}</p>
                </div>
              }
            </div>
          </div>
        </article>

        <article class="feature-card card border border-base-300 bg-base-100 shadow-lg">
          <div class="card-body space-y-4 p-6 md:p-8">
            <div class="section-heading">
              <p class="section-label">{{ copy().trustTitle }}</p>
              <h2 class="card-title text-2xl md:text-3xl">{{ copy().trustTitle }}</h2>
            </div>

            <div class="space-y-3">
              @for (item of copy().trustItems; track item) {
                <div class="flex items-start gap-3 rounded-2xl border border-base-200 bg-base-50 p-4">
                  <div class="mt-1 h-8 w-8 shrink-0 rounded-full bg-secondary/15 text-center text-sm leading-8 text-secondary">✓</div>
                  <p class="text-sm leading-6 text-base-content/75">{{ item }}</p>
                </div>
              }
            </div>

            <div class="about-cta rounded-3xl p-5 md:p-6">
              <p class="text-xs uppercase tracking-[0.22em] text-primary/80">{{ copy().ctaEyebrow }}</p>
              <h3 class="mt-2 text-xl font-semibold text-base-content">{{ copy().ctaTitle }}</h3>
              <p class="mt-2 max-w-xl text-sm leading-6 text-base-content/75">{{ copy().ctaBody }}</p>
            </div>
          </div>
        </article>
      </section>
    </section>
  `,
  styles: `
    .about-shell { position: relative; }
    .about-hero-surface {
      isolation: isolate;
      background:
        radial-gradient(circle at 16% 18%, rgba(255, 247, 237, 0.9), transparent 34%),
        radial-gradient(circle at 84% 24%, rgba(232, 196, 145, 0.2), transparent 28%),
        radial-gradient(circle at 80% 86%, rgba(205, 155, 103, 0.18), transparent 30%),
        linear-gradient(145deg, rgba(253, 247, 239, 0.98) 0%, rgba(244, 231, 213, 0.98) 55%, rgba(235, 214, 189, 0.96) 100%);
    }
    .hero-orb { position: absolute; border-radius: 9999px; pointer-events: none; filter: blur(4px); opacity: 0.8; }
    .hero-orb-a { top: -28px; right: 6%; width: 120px; height: 120px; background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(225,193,153,0.15) 58%, transparent 72%); }
    .hero-orb-b { bottom: -18px; left: 3%; width: 160px; height: 160px; background: radial-gradient(circle, rgba(191,137,90,0.16) 0%, transparent 70%); }
    .about-kicker, .section-label { letter-spacing: 0.22em; text-transform: uppercase; font-size: 0.72rem; font-weight: 700; color: #8a5e37; border-color: rgba(167,115,69,0.28); background: rgba(255,250,245,0.88); }
    .about-title { color: #55361f; text-wrap: balance; }
    .about-body { color: #6e4b31; line-height: 1.8; text-wrap: pretty; }
    .about-pill { display: inline-flex; align-items: center; border: 1px solid rgba(180,131,86,0.22); border-radius: 9999px; padding: 0.55rem 0.9rem; background: rgba(255,251,245,0.78); color: #7c5637; font-size: 0.875rem; font-weight: 600; }
    .stat-card { border-color: rgba(216,183,146,0.85); background: linear-gradient(180deg, rgba(255,252,248,0.95) 0%, rgba(247,236,222,0.98) 100%); }
    .feature-card { border-color: #d8be9f; background: linear-gradient(180deg, rgba(255,252,248,0.98) 0%, rgba(248,240,229,0.98) 100%); }
    .section-heading { display: grid; gap: 0.35rem; }
    .feature-copy { color: #6d4a31; line-height: 1.8; }
    .step-card { background: rgba(255,255,255,0.72); border-color: rgba(216,191,160,0.7); }
    .step-number { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: 9999px; background: rgba(191,137,90,0.14); color: #9b6236; font-size: 0.9rem; font-weight: 700; flex-shrink: 0; }
    .about-cta { border: 1px solid rgba(191,137,90,0.22); background: radial-gradient(circle at top right, rgba(255,255,255,0.8), transparent 42%), linear-gradient(135deg, rgba(248,231,212,0.98) 0%, rgba(239,218,193,0.98) 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6); }
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
          paragraphOne: 'تم تصميم Auto Essa لتبسيط طريقة استئجار أو شراء السيارات في مصر. نركز على الثقة، والمعلومات الواضحة، وسرعة التواصل.',
          paragraphTwo: 'مهمتنا هي تحويل التصفح إلى قرار واثق من خلال المواصفات الواضحة، والأسعار الصادقة، والدعم السريع.',
          missionLabel: 'المهمة والرؤية',
          missionTitle: 'تجربة شراء واستئجار أكثر وضوحًا',
          trustTitle: 'لماذا يثق بنا العملاء',
          trustScore: 'ثقة عالية',
          pillOne: 'قوائم واضحة',
          pillTwo: 'تواصل سريع',
          pillThree: 'قرارات أسرع',
          stats: [
            { label: 'سيارات', value: 'مميزة' },
            { label: 'خدمة', value: 'سريعة' },
            { label: 'تجربة', value: 'موثوقة' }
          ],
          highlights: [
            { icon: '★', title: 'اختيارات منتقاة', body: 'نعرض السيارات بشكل أوضح لتصل إلى الخيار المناسب بسرعة وثقة.' },
            { icon: '↗', title: 'استجابة مباشرة', body: 'فريقنا يركز على التواصل السريع بدل المراسلات الطويلة.' }
          ],
          processSteps: [
            { index: '1', title: 'استعرض', body: 'تصفح السيارات والمعلومات الأساسية بدون تعقيد.' },
            { index: '2', title: 'قارن', body: 'قارن السعر والمواصفات بسرعة لاتخاذ قرار أفضل.' },
            { index: '3', title: 'تواصل', body: 'أرسل الطلب أو تواصل مباشرة للحصول على رد أسرع.' }
          ],
          trustItems: [
            'قوائم واضحة ومحدثة باستمرار.',
            'تواصل سريع عبر واتساب والهاتف.',
            'تركيز على التحويل إلى طلبات فعلية بدل المراسلات الطويلة.'
          ],
          ctaEyebrow: 'جاهزون للمساعدة',
          ctaTitle: 'ابحث عن السيارة المناسبة بثقة أكبر',
          ctaBody: 'إذا كنت تبحث عن سيارة للشراء أو الإيجار، فستجد تجربة أكثر وضوحًا وسرعة مع Auto Essa.'
        }
      : {
          eyebrow: 'Trusted car marketplace',
          title: 'About Auto Essa',
          paragraphOne: 'Auto Essa was built to simplify how customers in Egypt rent or buy cars. We focus on trust, transparent information, and fast communication.',
          paragraphTwo: 'Our mission is to convert browsing into confident decisions through clear specs, honest pricing, and responsive support.',
          missionLabel: 'Mission and vision',
          missionTitle: 'A clearer car shopping experience',
          trustTitle: 'Why customers trust us',
          trustScore: 'Trusted',
          pillOne: 'Curated listings',
          pillTwo: 'Fast support',
          pillThree: 'Better decisions',
          stats: [
            { label: 'Cars', value: 'Featured' },
            { label: 'Support', value: 'Fast' },
            { label: 'Experience', value: 'Trusted' }
          ],
          highlights: [
            { icon: '★', title: 'Curated selection', body: 'We present cars in a clean, consistent way so users can compare faster.' },
            { icon: '↗', title: 'Direct response', body: 'The experience is designed to move from browsing to action with less friction.' }
          ],
          processSteps: [
            { index: '1', title: 'Browse', body: 'Explore cars and core details without visual clutter.' },
            { index: '2', title: 'Compare', body: 'Review pricing and specs quickly to narrow the right option.' },
            { index: '3', title: 'Connect', body: 'Send a request or contact the team for a faster answer.' }
          ],
          trustItems: [
            'Clear, up-to-date listings.',
            'Fast contact through WhatsApp and phone.',
            'Focused on turning browsing into real leads.'
          ],
          ctaEyebrow: 'Ready to help',
          ctaTitle: 'Find the right car with more confidence',
          ctaBody: 'Whether you want to rent or buy, Auto Essa is built to make the experience clearer, faster, and more professional.'
        }
  );
}
