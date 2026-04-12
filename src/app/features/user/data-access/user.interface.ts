export interface FavoriteCarItem {
	id: string;
	brand: string;
	model: string;
	year: number;
	price: number;
	imageUrl: string;
}

export interface BookingRequestItem {
	id: number;
	carTitle: string;
	fromDate: string;
	toDate: string;
	status: string;
}

export interface CarRequestItem {
	id: number | string;
	customerName: string;
	phoneNumber: string;
	desiredCar: string;
	budget: number;
	status: string;
}

export interface UserProfile {
	name: string;
	phone: string;
	email: string;
}

