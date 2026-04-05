import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  template: `
    <section class="hero-shell relative overflow-hidden rounded-4xl border px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16 mb-5">
      <div class="hero-glow hero-glow-left" aria-hidden="true"></div>
      <div class="hero-glow hero-glow-right" aria-hidden="true"></div>

      <div class="relative mx-auto max-w-3xl text-center">
        <p class="hero-kicker mb-3 text-xs font-semibold uppercase tracking-[0.22em]">Premium Car Marketplace</p>
        <h1 class="hero-title font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">{{ title() }}</h1>
        <p class="hero-subtitle mx-auto mt-4 max-w-2xl">{{ subtitle() }}</p>
        <div class="mt-7">
          <a href="#featured" class="hero-cta btn btn-primary btn-lg">{{ ctaText() }}</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero-shell {
      border-color: #d6b998;
      background:
        radial-gradient(circle at 8% 12%, rgba(248, 231, 211, 0.9), transparent 45%),
        radial-gradient(circle at 92% 84%, rgba(226, 191, 158, 0.45), transparent 50%),
        linear-gradient(135deg, #f9ecdc 0%, #efd9bd 52%, #e7c39b 100%);
      box-shadow: 0 30px 60px rgba(129, 83, 44, 0.22);
      isolation: isolate;
    }

    .hero-glow {
      position: absolute;
      border-radius: 999px;
      filter: blur(4px);
      pointer-events: none;
      z-index: 0;
    }

    .hero-glow-left {
      width: 220px;
      height: 220px;
      top: -60px;
      left: -50px;
      background: rgba(255, 248, 237, 0.7);
    }

    .hero-glow-right {
      width: 260px;
      height: 260px;
      bottom: -110px;
      right: -90px;
      background: rgba(205, 151, 103, 0.3);
    }

    .hero-kicker {
      color: #8b5f37;
    }

    .hero-title {
      color: #54361f;
      text-wrap: balance;
    }

    .hero-subtitle {
      color: #6d4b2d;
      line-height: 1.75;
      font-size: 1.03rem;
    }

    .hero-cta {
      border-color: #b27647;
      background: linear-gradient(135deg, #c88f5d 0%, #ac6f3d 100%);
      color: #fff8ee;
      min-width: 230px;
      border-radius: 0.95rem;
      letter-spacing: 0.01em;
      box-shadow: 0 14px 28px rgba(137, 85, 43, 0.28);
      transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
    }

    .hero-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 18px 34px rgba(137, 85, 43, 0.35);
      filter: saturate(1.05);
    }

    .hero-cta:focus-visible {
      outline: 3px solid rgba(152, 98, 54, 0.35);
      outline-offset: 3px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSectionComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
  ctaText = input('Browse Featured Cars');
}
