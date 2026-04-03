import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  template: `
    <footer class="border-t border-base-300 bg-base-200/50">
      <div class="flex w-full flex-col gap-2 px-4 py-8 text-sm text-base-content/80 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <p>Auto Essa . Rent and Buy Cars with confidence.</p>
        <p>WhatsApp: +20 100 000 0000</p>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteFooterComponent {}
