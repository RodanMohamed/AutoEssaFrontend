import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../features/auth/data-access/auth.service';
import { AuthStore } from '../../features/auth/data-access/auth.store';
import { LocaleService } from '../../core/services/locale.service';
import { LocaleSwitcherComponent } from './locale-switcher.component';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, LocaleSwitcherComponent],
  template: `
    <mat-toolbar class="border-b border-base-300 bg-base-100/90 backdrop-blur">
      <div class="flex w-full items-center justify-between gap-3 px-2 md:px-4 lg:px-6">
        <a routerLink="/" class="font-serif text-xl font-semibold tracking-wide text-primary">Auto Essa</a>
        <nav class="hidden items-center gap-2 md:flex" aria-label="Primary">
          <a mat-button routerLink="/" routerLinkActive="text-primary" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a mat-button routerLink="/cars" routerLinkActive="text-primary">Cars</a>
          <a mat-button routerLink="/request-car" routerLinkActive="text-primary">Request Car</a>
          @if (isAuthenticated()) {
            <a mat-button routerLink="/account" routerLinkActive="text-primary">My Account</a>
          }
          @if (isAdmin()) {
            <a mat-button routerLink="/dashboard" routerLinkActive="text-primary">Dashboard</a>
          }
          <a mat-button routerLink="/about" routerLinkActive="text-primary">About</a>
          <a mat-button routerLink="/contact" routerLinkActive="text-primary">Contact</a>
        </nav>
        <div class="flex items-center gap-2">
          <span class="badge badge-outline">{{ locale() === 'ar' ? 'AR' : 'EN' }}</span>
          <app-locale-switcher />
          @if (!isAuthenticated()) {
            <a routerLink="/auth/login" class="btn btn-primary btn-sm">Login</a>
          } @else {
            <button type="button" class="btn btn-outline btn-sm" (click)="logout()">Logout</button>
          }
        </div>
      </div>
    </mat-toolbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteHeaderComponent {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly localeService = inject(LocaleService);

  protected readonly isAuthenticated = computed(() => this.authStore.isAuthenticated());
  protected readonly isAdmin = computed(() => this.authStore.isAdmin());
  protected readonly locale = computed(() => this.localeService.locale());

  protected logout() {
    this.authService.logout();
  }
}
