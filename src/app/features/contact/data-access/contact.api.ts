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
      phoneNumber: typeof source['phoneNumber'] === 'string' ? source['phoneNumber'] : '+20 10 96060677',
      whatsAppNumber: typeof source['whatsAppNumber'] === 'string' ? source['whatsAppNumber'] : '+20 10 96060677',
      address: typeof source['address'] === 'string' ? source['address'] : 'Cairo, Egypt',
      googleMapsUrl:
        typeof source['googleMapsUrl'] === 'string'
          ? source['googleMapsUrl']
          : 'https://www.google.com/maps/place/%D8%B9%D9%8A%D8%B3%D9%89+%D9%84%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA%E2%80%AD/@30.0586402,31.2141598,17z/data=!3m1!4b1!4m6!3m5!1s0x1458412035347337:0xef4d45c14349c49e!8m2!3d30.0586402!4d31.2141598!16s%2Fg%2F1tj435wp!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D',
      workingHours: typeof source['workingHours'] === 'string' ? source['workingHours'] : 'Daily 10:00 AM - 10:00 PM'
    };
  }

  private defaultContactInfo(): ContactInfo {
    return {
      phoneNumber: '+20 10 96060677',
      whatsAppNumber: '+20 10 96060677',
      address: 'Cairo, Egypt',
      googleMapsUrl: 'https://www.google.com/maps/place/%D8%B9%D9%8A%D8%B3%D9%89+%D9%84%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA%E2%80%AD/@30.0586402,31.2141598,17z/data=!3m1!4b1!4m6!3m5!1s0x1458412035347337:0xef4d45c14349c49e!8m2!3d30.0586402!4d31.2141598!16s%2Fg%2F1tj435wp!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D',
      workingHours: 'Daily 10:00 AM - 10:00 PM'
    };
  }
}
