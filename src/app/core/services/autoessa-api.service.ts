import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE_URL } from '../core.config';
import {
  CreateBookingRequestPayload,
  CreateCarRequestLeadPayload,
  CreateContactMessagePayload,
  LoginPayload,
  RegisterPayload,
  UpdateContactInfoPayload,
  UpdateHomePageContentPayload,
  UpdateStatusPayload,
  UpdateUserBlockPayload
} from '../interfaces/autoessa-endpoints.interface';

@Injectable({ providedIn: 'root' })
export class AutoessaApiService {
  private readonly http = inject(HttpClient);

  // Auth
  register(payload: RegisterPayload) { return this.http.post(`${API_BASE_URL}/api/Auth/register`, payload); }
  login(payload: LoginPayload) { return this.http.post(`${API_BASE_URL}/api/Auth/login`, payload); }

  // Cars and user-facing features
  getCars(params?: HttpParams) { return this.http.get(`${API_BASE_URL}/api/Cars`, { params }); }
  getCarById(id: string) { return this.http.get(`${API_BASE_URL}/api/Cars/${id}`); }
  createBookingRequest(payload: CreateBookingRequestPayload) { return this.http.post(`${API_BASE_URL}/api/BookingRequests`, payload); }
  getBookingAvailability(carId?: string, startDate?: string, endDate?: string) {
    let params = new HttpParams();
    if (carId) { params = params.set('CarId', carId); }
    if (startDate) { params = params.set('StartDate', startDate); }
    if (endDate) { params = params.set('EndDate', endDate); }
    return this.http.get(`${API_BASE_URL}/api/BookingRequests/availability`, { params });
  }
  getMyBookingRequests() { return this.http.get(`${API_BASE_URL}/api/BookingRequests/me`); }
  createCarLeadRequest(payload: CreateCarRequestLeadPayload) {
    const endpoint = `${API_BASE_URL}/api/CarRequests`;
    const requestBody = this.toCreateCarRequestBody(payload);

    // Try ONLY the nested request structure
    const finalPayload = {
      request: requestBody
    };

    // DEBUG: Log the exact payload being sent
    console.log(' API: Final payload for CarRequests:', JSON.stringify(finalPayload, null, 2));
    console.log(' FullName value:', finalPayload.request.FullName || finalPayload.request.fullName);

    return this.http.post(endpoint, finalPayload);
  }
  getMyCarRequests() { return this.http.get(`${API_BASE_URL}/api/CarRequests/me`); }
  getMyFavorites() { return this.http.get(`${API_BASE_URL}/api/Favorites/me`); }
  addFavorite(carId: string) { return this.http.post(`${API_BASE_URL}/api/Favorites/${carId}`, {}); }
  removeFavorite(carId: string) { return this.http.delete(`${API_BASE_URL}/api/Favorites/${carId}`); }
  getWhatsAppLink(carId: string) { return this.http.get(`${API_BASE_URL}/api/WhatsApp/car/${carId}`); }

  // Content and contact
  getContactInfo() { return this.http.get(`${API_BASE_URL}/api/Contact/info`); }
  createContactMessage(payload: CreateContactMessagePayload) { return this.http.post(`${API_BASE_URL}/api/Contact/messages`, payload); }
  getHomeContent() { return this.http.get(`${API_BASE_URL}/api/Content/homepage`); }
  getLocalizationSettings() { return this.http.get(`${API_BASE_URL}/api/Localization/settings`); }

  // Admin booking and car requests
  adminGetBookingRequests(status?: number) {
    const params = typeof status === 'number' ? new HttpParams().set('status', String(status)) : undefined;
    return this.http.get(`${API_BASE_URL}/api/admin/bookingrequests`, { params });
  }
  adminUpdateBookingRequestStatus(id: string, payload: UpdateStatusPayload) {
    return this.http.patch(`${API_BASE_URL}/api/admin/bookingrequests/${id}/status`, payload);
  }
  adminGetCarRequests(status?: number) {
    const params = typeof status === 'number' ? new HttpParams().set('status', String(status)) : undefined;
    return this.http.get(`${API_BASE_URL}/api/admin/carrequests`, { params });
  }
  adminUpdateCarRequestStatus(id: string, payload: UpdateStatusPayload) {
    return this.http.patch(`${API_BASE_URL}/api/admin/carrequests/${id}/status`, payload);
  }

  // Admin cars and uploads
  adminCreateCar(payload: unknown) { return this.http.post(`${API_BASE_URL}/api/admin/cars`, payload); }
  adminUpdateCar(id: string, payload: unknown) { return this.http.put(`${API_BASE_URL}/api/admin/cars/${id}`, payload); }
  adminDeleteCar(id: string) { return this.http.delete(`${API_BASE_URL}/api/admin/cars/${id}`); }
  adminUploadCarImages(formData: FormData) { return this.http.post(`${API_BASE_URL}/api/admin/uploads/car-images`, formData); }
  adminDeleteUploadedImage(payload: { imageUrl: string }) { return this.http.delete(`${API_BASE_URL}/api/admin/uploads/car-images`, { body: payload }); }

  // Admin contact and content
  adminUpdateContactInfo(payload: UpdateContactInfoPayload) { return this.http.put(`${API_BASE_URL}/api/admin/contact/info`, payload); }
  adminGetContactMessages(status?: number) {
    const params = typeof status === 'number' ? new HttpParams().set('status', String(status)) : undefined;
    return this.http.get(`${API_BASE_URL}/api/admin/contact/messages`, { params });
  }
  adminUpdateContactMessageStatus(id: string, payload: UpdateStatusPayload) {
    return this.http.patch(`${API_BASE_URL}/api/admin/contact/messages/${id}/status`, payload);
  }
  adminUpdateHomeContent(payload: UpdateHomePageContentPayload) { return this.http.put(`${API_BASE_URL}/api/admin/content/homepage`, payload); }

  // Admin users
  adminGetUsers() { return this.http.get(`${API_BASE_URL}/api/admin/users`); }
  adminBlockUser(id: string, payload: UpdateUserBlockPayload) { return this.http.patch(`${API_BASE_URL}/api/admin/users/${id}/block`, payload); }
  adminDeleteUser(id: string) { return this.http.delete(`${API_BASE_URL}/api/admin/users/${id}`); }

  private toCreateCarRequestBody(payload: CreateCarRequestLeadPayload) {
    // Ensure all string fields are properly trimmed
    const fullNameTrimmed = typeof payload.fullName === 'string' ? payload.fullName.trim() : '';
    const phoneNumberTrimmed = typeof payload.phoneNumber === 'string' ? payload.phoneNumber.trim() : '';
    const desiredBrandTrimmed = typeof payload.desiredBrand === 'string' ? payload.desiredBrand.trim() : '';
    const desiredModelTrimmed = typeof payload.desiredModel === 'string' ? payload.desiredModel.trim() : '';
    const notesTrimmed = typeof payload.notes === 'string' ? payload.notes.trim() : '';

    // Safety check: ensure fullName is not empty
    if (fullNameTrimmed.length === 0) {
      console.error('❌ CRITICAL: fullName is empty after trimming!');
      throw new Error('Full Name cannot be empty');
    }

    return {
      // Required fields - use both camelCase and PascalCase for maximum compatibility
      fullName: fullNameTrimmed,
      FullName: fullNameTrimmed,
      phoneNumber: phoneNumberTrimmed,
      PhoneNumber: phoneNumberTrimmed,
      desiredBrand: desiredBrandTrimmed,
      DesiredBrand: desiredBrandTrimmed,
      desiredModel: desiredModelTrimmed,
      DesiredModel: desiredModelTrimmed,

      // Optional userId
      ...(typeof payload.userId === 'string' && payload.userId.trim().length > 0
        ? { userId: payload.userId.trim(), UserId: payload.userId.trim() }
        : {}),

      // Optional year range
      ...(typeof payload.desiredYearFrom === 'number'
        ? { desiredYearFrom: payload.desiredYearFrom, DesiredYearFrom: payload.desiredYearFrom }
        : {}),
      ...(typeof payload.desiredYearTo === 'number'
        ? { desiredYearTo: payload.desiredYearTo, DesiredYearTo: payload.desiredYearTo }
        : {}),

      // Optional budget
      ...(typeof payload.budget === 'number' ? { budget: payload.budget, Budget: payload.budget } : {}),

      // Optional notes
      ...(notesTrimmed.length > 0 ? { notes: notesTrimmed, Notes: notesTrimmed } : {})
    };
  }

}
