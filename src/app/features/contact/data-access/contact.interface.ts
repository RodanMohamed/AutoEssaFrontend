export interface ContactInfo {
  phoneNumber: string;
  whatsAppNumber: string;
  address: string;
  googleMapsUrl: string;
  workingHours: string;
}

export interface CreateContactMessageRequest {
  name: string;
  phoneNumber: string;
  message: string;
}
