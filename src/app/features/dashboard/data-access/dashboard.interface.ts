export interface DashboardStats {
	totalCars: number;
	totalUsers: number;
	openBookingRequests: number;
	openContactMessages: number;
}

export interface BookingRequestSummary {
	id: string;
	customerName: string;
	phone: string;
	carTitle: string;
	status: string;
}

