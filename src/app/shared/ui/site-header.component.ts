import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
        <div class="mx-auto flex w-full max-w-330 flex-col px-2 py-2 md:px-4 lg:px-6">
          <!-- Top Row: Brand | Nav | Auth -->
          <div class="flex items-center justify-between gap-2">
            <a routerLink="/" class="brand-link font-serif text-xl font-semibold tracking-wide shrink-0">Auto Essa</a>

            <!-- Desktop Nav (center on large screens) -->
            <nav class="hidden items-center gap-1 lg:flex flex-1 justify-center" aria-label="Primary">
              @if (isAuthenticated() && isAdmin()) {
                <a mat-button routerLink="/dashboard" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
                <a mat-button routerLink="/dashboard/cars" routerLinkActive="is-active">Cars</a>
                <a mat-button routerLink="/dashboard/requests" routerLinkActive="is-active">Requests</a>
                <a mat-button routerLink="/dashboard/moderation" routerLinkActive="is-active">Moderation</a>
                <a mat-button routerLink="/dashboard/content" routerLinkActive="is-active">Content</a>
              } @else {
                <a mat-button routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
              }

              @if (isAuthenticated() && !isAdmin()) {
                <a mat-button routerLink="/cars" routerLinkActive="is-active">Cars</a>
                <a mat-button routerLink="/request-car" routerLinkActive="is-active">Request Car</a>
                <a mat-button routerLink="/account" routerLinkActive="is-active">My Account</a>
                <a mat-button routerLink="/about" routerLinkActive="is-active">About</a>
                <a mat-button routerLink="/contact" routerLinkActive="is-active">Contact</a>
              }
            </nav>

            <!-- Header Right: Locale always visible + responsive auth/menu -->
            <div class="flex items-center gap-2 shrink-0">
              <app-locale-switcher />

              <button
                type="button"
                class="btn btn-ghost btn-xs  lg:hidden "
                (click)="toggleMenu()"
                aria-label="Toggle menu">
                @if (!isMenuOpen()) {
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                } @else {
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                }
              </button>

              <div class="hidden lg:flex items-center gap-2">
              @if (!isAuthenticated()) {
                <a routerLink="/auth/login" class="btn btn-primary w-14  header-cta py-3 h-5 text-sm " style="border-radius: 0">Login</a>
              } @else {
                <button type="button" class="btn btn-outline w-14 header-cta py-3 h-5 text-sm" (click)="logout()">Logout</button>
              }
              </div>
            </div>
          </div>

          <!-- Mobile Menu (dropdown below) -->
          @if (isMenuOpen()) {
            <nav class="mobile-menu flex flex-col gap-1 lg:hidden border-t border-base-300 pt-7" aria-label="Mobile navigation">
              @if (isAuthenticated() && isAdmin()) {
      <!-- Admin links -->
      <a class="mobile-link" routerLink="/dashboard" routerLinkActive="mobile-link-active" [routerLinkActiveOptions]="{ exact: true }" (click)="toggleMenu()">Overview</a>
      <a class="mobile-link" routerLink="/dashboard/cars" routerLinkActive="mobile-link-active" (click)="toggleMenu()">Cars</a>
      <a class="mobile-link" routerLink="/dashboard/requests" routerLinkActive="mobile-link-active" (click)="toggleMenu()">Requests</a>
      <a class="mobile-link" routerLink="/dashboard/moderation" routerLinkActive="mobile-link-active" (click)="toggleMenu()">Moderation</a>
      <a class="mobile-link" routerLink="/dashboard/content" routerLinkActive="mobile-link-active" (click)="toggleMenu()">Content</a>

    } @else if (isAuthenticated() && !isAdmin()) {
      <!-- Authenticated user links -->
      <a class="mobile-link" routerLink="/account" routerLinkActive="mobile-link-active" (click)="toggleMenu()">My Account</a>
      <a class="mobile-link" routerLink="/" routerLinkActive="mobile-link-active" [routerLinkActiveOptions]="{ exact: true }" (click)="toggleMenu()">Home</a>
      <a class="mobile-link" routerLink="/request-car" routerLinkActive="mobile-link-active" (click)="toggleMenu()">Request Car</a>
      <a class="mobile-link" routerLink="/cars" routerLinkActive="mobile-link-active" (click)="toggleMenu()">Cars</a>
      <a class="mobile-link" routerLink="/about" routerLinkActive="mobile-link-active" (click)="toggleMenu()">About</a>
      <a class="mobile-link" routerLink="/contact" routerLinkActive="mobile-link-active" (click)="toggleMenu()">Contact</a>

    } @else {
      <!-- Guest links -->
      <a class="mobile-link" routerLink="/" routerLinkActive="mobile-link-active" [routerLinkActiveOptions]="{ exact: true }" (click)="toggleMenu()">Home</a>
    }
              <!-- Auth in Menu -->
              @if (!isAuthenticated()) {
                <a routerLink="/auth/login" class="btn btn-primary " (click)="toggleMenu()">Login</a>
              } @else {
                <button type="button" class="btn btn-outline btn-sm w-full" (click)="handleLogoutMobile()">Logout</button>
              }
            </nav>
          }
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
      min-height: auto;
      padding: 0;
    }

    .brand-link {
      color: #5b3b21;
      text-decoration: none;
      flex-shrink: 0;
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
      flex-shrink: 0;
    }

    .mobile-menu {
      animation: slideDown 200ms ease-out;
      background: rgba(255, 249, 240, 0.98);
      border: 1px solid #e0c6a7;
      border-radius: 0.75rem;
      padding: 0.6rem;
      box-shadow: 0 10px 24px rgba(124, 80, 38, 0.12);
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .mobile-link {
      color: #6e4b2d;
      text-decoration: none;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: background 150ms ease;
    }

    .mobile-link:hover {
      background: rgba(200, 146, 97, 0.1);
    }

    .mobile-link-active {
      background: rgba(200, 146, 97, 0.14);
      color: #8f5f35;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteHeaderComponent {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);

  protected readonly isMenuOpen = signal(false);
  protected readonly isAuthenticated = computed(() => this.authStore.isAuthenticated());
  protected readonly isAdmin = computed(() => this.authStore.isAdmin());

  protected toggleMenu() {
    this.isMenuOpen.update(val => !val);
  }

  protected logout() {
    this.authService.logout();

  }

  protected handleLogoutMobile() {
    this.toggleMenu();
    this.logout();
  }
}
