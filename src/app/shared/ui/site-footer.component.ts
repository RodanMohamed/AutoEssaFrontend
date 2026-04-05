import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { LocaleService } from '../../core/services/locale.service';

@Component({
  selector: 'app-site-footer',
  template: `
    <footer class="border-t border-base-300 bg-base-200/50">
      <div class="flex w-full flex-col gap-2 px-4 py-8 text-sm text-base-content/80 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <p>{{ copy().tagline }}</p>
        <p>{{ copy().whatsApp }}</p>
      </div>
    </footer>
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
