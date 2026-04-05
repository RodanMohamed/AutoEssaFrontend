import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SiteFooterComponent } from '../../shared/ui/site-footer.component';
import { SiteHeaderComponent } from '../../shared/ui/site-header.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <div class="app-shell min-h-screen text-base-content">
      <app-site-header />
      <main class="app-main mx-auto w-full max-w-[1320px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <router-outlet />
      </main>
      <app-site-footer />
    </div>
  `,
  styles: `
    .app-shell {
      background:
        radial-gradient(circle at 12% 8%, rgba(238, 214, 186, 0.42), transparent 34%),
        radial-gradient(circle at 90% 90%, rgba(214, 183, 152, 0.24), transparent 42%),
        linear-gradient(165deg, #fcf5eb 0%, #f5eadc 58%, #efe0ce 100%);
    }

    .app-main > * {
      animation: page-fade-up 430ms ease-out both;
    }

    @keyframes page-fade-up {
      from {
        opacity: 0;
        transform: translateY(10px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {}
