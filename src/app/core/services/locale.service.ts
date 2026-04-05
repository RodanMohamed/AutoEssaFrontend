import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly document = inject(DOCUMENT);
  private readonly storedLocale = this.readStoredLocale();

  readonly locale = signal<'en' | 'ar'>(this.storedLocale);

  constructor() {
    effect(() => {
      const value = this.locale();
      localStorage.setItem('autoessa.locale', value);
      this.document.documentElement.lang = value;
      this.document.documentElement.dir = value === 'ar' ? 'rtl' : 'ltr';
    });
  }

  setLocale(value: 'en' | 'ar') {
    this.locale.set(value);
  }

  toggleLocale() {
    this.locale.set(this.locale() === 'en' ? 'ar' : 'en');
  }

  private readStoredLocale(): 'en' | 'ar' {
    const value = localStorage.getItem('autoessa.locale');
    return value === 'ar' ? 'ar' : 'en';
  }
}
