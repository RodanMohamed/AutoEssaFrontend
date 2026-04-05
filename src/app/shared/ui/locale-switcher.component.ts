import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { LocaleService } from '../../core/services/locale.service';

@Component({
  selector: 'app-locale-switcher',
  template: `
    <div class="locale-switcher join border border-base-300 bg-base-100 shadow-sm">
      <button class="btn btn-xs join-item" type="button" [class.btn-primary]="isEnglish()" (click)="setEnglish()">EN</button>
      <button class="btn btn-xs join-item" type="button" [class.btn-primary]="isArabic()" (click)="setArabic()">AR</button>
    </div>
  `,
  styles: `
    .locale-switcher {
      border-radius: 0.7rem;
      overflow: hidden;
    }

    .locale-switcher .btn {
      min-height: 2rem;
      height: 2rem;
      padding-inline: 0.55rem;
      font-size: 0.74rem;
      font-weight: 700;
      border-radius: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocaleSwitcherComponent {
  private readonly localeService = inject(LocaleService);

  protected readonly locale = this.localeService.locale;
  protected readonly isEnglish = computed(() => this.locale() === 'en');
  protected readonly isArabic = computed(() => this.locale() === 'ar');

  protected setEnglish() {
    this.localeService.setLocale('en');
  }

  protected setArabic() {
    this.localeService.setLocale('ar');
  }
}
