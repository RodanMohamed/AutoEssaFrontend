import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { LocaleService } from '../../core/services/locale.service';

@Component({
  selector: 'app-site-footer',
  template: `
    <footer class="site-footer border-t">
      <div class="mx-auto flex w-full max-w-[1320px] flex-col gap-2 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <p class="tagline">{{ copy().tagline }}</p>
        <p class="whatsapp">{{ copy().whatsApp }}</p>
      </div>
    </footer>
  `,
  styles: `
    .site-footer {
      border-color: #d9c3a8;
      background: linear-gradient(180deg, rgba(252, 245, 235, 0.62) 0%, rgba(246, 233, 217, 0.9) 100%);
    }

    .tagline,
    .whatsapp {
      color: #6f4e31;
    }

    .whatsapp {
      font-weight: 600;
      letter-spacing: 0.01em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteFooterComponent {
  private readonly localeService = inject(LocaleService);

  protected readonly copy = computed(() =>
    this.localeService.locale() === 'ar'
      ? {
          tagline: 'Auto Essa . استأجر واشترِ السيارات بثقة.',
          whatsApp: 'واتساب: +20 100 000 0000'
        }
      : {
          tagline: 'Auto Essa . Rent and Buy Cars with confidence.',
          whatsApp: 'WhatsApp: +20 100 000 0000'
        }
  );
}
