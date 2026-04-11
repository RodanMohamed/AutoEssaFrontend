import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { LocaleService } from '../../core/services/locale.service';

@Component({
  selector: 'app-site-footer',
  template: `
    <footer class="site-footer border-t">
      <div class="mx-auto flex w-full max-w-[1320px] flex-col gap-2 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <p class="tagline">{{ copy().tagline }}</p>
        <div class="contact-links flex flex-col gap-1 text-right">
          <a class="whatsapp" href="https://wa.me/201096060677" target="_blank" rel="noopener">{{ copy().whatsApp }}</a>
          <a class="phone" href="tel:+201096060677">{{ copy().phone }}</a>
        </div>
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

    .contact-links a {
      color: #6f4e31;
      text-decoration: none;
    }

    .contact-links a:hover {
      text-decoration: underline;
      text-underline-offset: 0.2rem;
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
          whatsApp: 'واتساب:٠١٠٩٦٠٦٠٦٧٧ ',
          phone: 'اتصال:٠١٠٩٦٠٦٠٦٧٧'
        }
      : {
          tagline: 'Auto Essa . Rent and Buy Cars with confidence.',
          whatsApp: 'WhatsApp: +20 10 96060677',
          phone: 'Call: +20 10 96060677'
        }
  );
}
