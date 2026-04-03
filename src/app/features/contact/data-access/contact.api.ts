import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { API_BASE_URL } from '../../../core/core.config';
import { ContactInfo, CreateContactMessageRequest } from './contact.interface';

@Injectable({ providedIn: 'root' })
export class ContactApi {
  private readonly http = inject(HttpClient);

  getContactInfo() {
    return this.http.get<unknown>(`${API_BASE_URL}/api/Contact/info`).pipe(
      map((payload) => this.toContactInfo(payload)),
      catchError(() => of(this.defaultContactInfo()))
    );
  }

  sendMessage(payload: CreateContactMessageRequest) {
    return this.http.post(`${API_BASE_URL}/api/Contact/messages`, payload);
  }

  private toContactInfo(payload: unknown): ContactInfo {
    const source = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};

    return {
      phoneNumber: typeof source['phoneNumber'] === 'string' ? source['phoneNumber'] : '+20 100 000 0000',
      whatsAppNumber: typeof source['whatsAppNumber'] === 'string' ? source['whatsAppNumber'] : '+20 100 000 0000',
      address: typeof source['address'] === 'string' ? source['address'] : 'Cairo, Egypt',
      googleMapsUrl:
        typeof source['googleMapsUrl'] === 'string'
          ? source['googleMapsUrl']
          : 'https://www.google.com/maps?q=Cairo&output=embed',
      workingHours: typeof source['workingHours'] === 'string' ? source['workingHours'] : 'Daily 10:00 AM - 10:00 PM'
    };
  }

  private defaultContactInfo(): ContactInfo {
    return {
      phoneNumber: '+20 100 000 0000',
      whatsAppNumber: '+20 100 000 0000',
      address: 'Cairo, Egypt',
      googleMapsUrl: 'https://www.google.com/maps?q=Cairo&output=embed',
      workingHours: 'Daily 10:00 AM - 10:00 PM'
    };
  }
}
