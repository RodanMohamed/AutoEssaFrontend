import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SiteFooterComponent } from '../../shared/ui/site-footer.component';
import { SiteHeaderComponent } from '../../shared/ui/site-header.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <div class="min-h-screen bg-base-200/40 text-base-content">
      <app-site-header />
      <main class="w-full px-4 py-6 md:px-6 lg:px-8">
        <router-outlet />
      </main>
      <app-site-footer />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {}
