import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { API_BASE_URL } from '../../../core/core.config';
import { HomeContent, LocalizationSetting } from './home-content.interface';

@Injectable({ providedIn: 'root' })
export class HomeContentApi {
  private readonly http = inject(HttpClient);

  getHomeContent() {
    return this.http.get<unknown>(`${API_BASE_URL}/api/Content/homepage`).pipe(
      map((payload) => this.toHomeContent(payload)),
      catchError(() => of(this.defaultHomeContent()))
    );
  }

  getLocalizationSettings() {
    return this.http.get<unknown>(`${API_BASE_URL}/api/Localization/settings`).pipe(
      map((payload) => this.toLocalization(payload)),
      catchError(() => of([] as LocalizationSetting[]))
    );
  }

  private toHomeContent(payload: unknown): HomeContent {
    const source = this.toRecord(payload);
    return {
      heroHeadline: this.readString(source, 'heroHeadline', 'Premium Cars for Rent and Sale'),
      heroSubHeadline: this.readString(source, 'heroSubHeadline', 'Quick search, trusted listings, and direct WhatsApp booking in minutes.'),
      heroCtaText: this.readString(source, 'heroCtaText', 'Browse Featured Cars'),
      whyChooseUsText: this.readString(source, 'whyChooseUsText', 'Verified cars, transparent pricing, and responsive support.'),
      heroHeadlineAr: this.readOptionalString(source, 'heroHeadlineAr'),
      heroSubHeadlineAr: this.readOptionalString(source, 'heroSubHeadlineAr'),
      heroCtaTextAr: this.readOptionalString(source, 'heroCtaTextAr'),
      whyChooseUsTextAr: this.readOptionalString(source, 'whyChooseUsTextAr')
    };
  }

  private toLocalization(payload: unknown): LocalizationSetting[] {
    const source = this.toRecord(payload);
    return Object.entries(source).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value)
    }));
  }

  private defaultHomeContent(): HomeContent {
    return {
      heroHeadline: 'Premium Cars for Rent and Sale',
      heroSubHeadline: 'Quick search, trusted listings, and direct WhatsApp booking in minutes.',
      heroCtaText: 'Browse Featured Cars',
      whyChooseUsText: 'Verified cars, transparent pricing, and responsive support.'
    };
  }

  private extractCollection(payload: unknown): unknown[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (typeof payload === 'object' && payload !== null) {
      const source = payload as Record<string, unknown>;
      const candidates = [source['items'], source['data'], source['value']];
      for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
          return candidate;
        }
      }
    }

    return [];
  }

  private toRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  }

  private readString(source: Record<string, unknown>, key: string, fallback: string): string {
    const value = source[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  }

  private readOptionalString(source: Record<string, unknown>, key: string): string | undefined {
    const value = source[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  }

  private readNumber(source: Record<string, unknown>, key: string, fallback: number): number {
    const value = source[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }
}
