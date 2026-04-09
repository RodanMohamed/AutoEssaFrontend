export interface FavoriteCarItem {
	id: number;
	brand: string;
	model: string;
	year: number;
	price: number;
}

export interface BookingRequestItem {
	id: number;
	carTitle: string;
	fromDate: string;
	toDate: string;
	status: string;
}

export interface UserProfile {
	name: string;
	phone: string;
	email: string;
}

