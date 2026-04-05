export interface CreateBookingRequestPayload {
  carId: string;
  userId?: string | null;
  fullName: string;
  phoneNumber: string;
  message?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CreateCarRequestLeadPayload {
  userId?: string | null;
  fullName: string;
  phoneNumber: string;
  desiredBrand: string;
  desiredModel: string;
  desiredYearFrom?: number | null;
  desiredYearTo?: number | null;
  budget?: number | null;
  notes?: string | null;
}

export interface CreateContactMessagePayload {
  name: string;
  phoneNumber: string;
  message: string;
}

export interface CreateReviewPayload {
  carId: string;
  userId?: string | null;
  fullName: string;
  rating: number;
  comment?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateStatusPayload {
  status: number;
}

export interface UpdateUserBlockPayload {
  isBlocked: boolean;
}

export interface UpdateReviewApprovalPayload {
  isApproved: boolean;
}

export interface UpdateTestimonialPublishPayload {
  isPublished: boolean;
}

export interface UpsertTestimonialPayload {
  customerName: string;
  comment: string;
  rating: number;
}

export interface UpdateContactInfoPayload {
  phoneNumber: string;
  whatsAppNumber: string;
  address: string;
  googleMapsUrl: string;
  workingHours: string;
}

export interface UpdateHomePageContentPayload {
  heroHeadline: string;
  heroSubHeadline: string;
  heroCtaText: string;
  whyChooseUsText: string;
}
