import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../features/auth/data-access/auth.service';
import { AuthStore } from '../../features/auth/data-access/auth.store';
import { LocaleSwitcherComponent } from './locale-switcher.component';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, LocaleSwitcherComponent],
  template: `
    <header class="site-header sticky top-0 z-40 border-b">
      <mat-toolbar class="site-toolbar">
        <div class="mx-auto flex w-full max-w-330 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-2 py-1 md:px-4 lg:px-6">
          <a routerLink="/" class="brand-link font-serif text-xl font-semibold tracking-wide">Auto Essa</a>

          <nav class="hidden items-center gap-1 lg:flex" aria-label="Primary">
            <a mat-button routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
            <a mat-button routerLink="/cars" routerLinkActive="is-active">Cars</a>
            <a mat-button routerLink="/request-car" routerLinkActive="is-active">Request Car</a>
            @if (isAuthenticated()) {
              <a mat-button routerLink="/account" routerLinkActive="is-active">My Account</a>
            }
            @if (isAdmin()) {
              <a mat-button routerLink="/dashboard" routerLinkActive="is-active">Dashboard</a>
            }
            <a mat-button routerLink="/about" routerLinkActive="is-active">About</a>
            <a mat-button routerLink="/contact" routerLinkActive="is-active">Contact</a>
          </nav>

          <div class="flex items-center gap-2">
            <app-locale-switcher />
            @if (!isAuthenticated()) {
              <a routerLink="/auth/login" class="btn btn-primary btn-sm header-cta">Login</a>
            } @else {
              <button type="button" class="btn btn-outline btn-sm header-cta" (click)="logout()">Logout</button>
            }
          </div>

          <nav class="mobile-nav flex w-full items-center gap-2 overflow-x-auto py-1 lg:hidden" aria-label="Mobile primary">
            <a class="chip-link" routerLink="/" routerLinkActive="chip-link-active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
            <a class="chip-link" routerLink="/cars" routerLinkActive="chip-link-active">Cars</a>
            <a class="chip-link" routerLink="/request-car" routerLinkActive="chip-link-active">Request Car</a>
            @if (isAuthenticated()) {
              <a class="chip-link" routerLink="/account" routerLinkActive="chip-link-active">My Account</a>
            }
            @if (isAdmin()) {
              <a class="chip-link" routerLink="/dashboard" routerLinkActive="chip-link-active">Dashboard</a>
            }
            <a class="chip-link" routerLink="/about" routerLinkActive="chip-link-active">About</a>
            <a class="chip-link" routerLink="/contact" routerLinkActive="chip-link-active">Contact</a>
          </nav>
        </div>
      </mat-toolbar>
    </header>
  `,
  styles: `
    .site-header {
      border-color: #d9c3a8;
      background: rgba(255, 246, 235, 0.84);
      backdrop-filter: blur(10px);
    }

    .site-toolbar {
      background: transparent;
      color: #5e3f24;
      min-height: 72px;
    }

    .brand-link {
      color: #5b3b21;
      text-decoration: none;
    }

    :host ::ng-deep a[mat-button] {
      border-radius: 0.75rem;
      color: #6e4b2d;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    :host ::ng-deep a[mat-button].is-active {
      background: rgba(200, 146, 97, 0.14);
      color: #8f5f35;
    }

    .header-cta {
      min-width: 84px;
    }

    .mobile-nav {
      scrollbar-width: thin;
      scrollbar-color: #c9a179 transparent;
    }

    .chip-link {
      border: 1px solid #d4b190;
      background: rgba(255, 250, 243, 0.92);
      border-radius: 999px;
      color: #7a5430;
      font-size: 0.86rem;
      font-weight: 600;
      padding: 0.34rem 0.74rem;
      text-decoration: none;
      white-space: nowrap;
    }

    .chip-link-active {
      border-color: #b67d4d;
      background: rgba(199, 143, 92, 0.2);
      color: #8c5b30;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteHeaderComponent {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);

  protected readonly isAuthenticated = computed(() => this.authStore.isAuthenticated());
  protected readonly isAdmin = computed(() => this.authStore.isAdmin());

  protected logout() {
    this.authService.logout();
  }
}
