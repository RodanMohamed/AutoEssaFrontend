import { BookingRequestItem, CarRequestItem, FavoriteCarItem } from '../data-access/user.interface';
import { normalizeDate } from './user.helpers';

export function mapFavorite(item: Record<string, unknown>, fallbackId: number): FavoriteCarItem {
	const nestedCar = typeof item['car'] === 'object' && item['car'] !== null
		? (item['car'] as Record<string, unknown>)
		: null;

	const idCandidate = item['carId'] ?? item['id'] ?? nestedCar?.['id'];
	const brandCandidate = item['brand'] ?? nestedCar?.['brand'];
	const modelCandidate = item['model'] ?? nestedCar?.['model'] ?? item['name'] ?? nestedCar?.['name'];
	const yearCandidate = item['year'] ?? nestedCar?.['year'];
	const priceCandidate = item['price'] ?? nestedCar?.['price'];
	const imageCandidate = item['imageUrl'] ?? item['coverImageUrl'] ?? nestedCar?.['imageUrl'] ?? nestedCar?.['coverImageUrl'];

	const priceNumber =
		typeof priceCandidate === 'number'
			? priceCandidate
			: typeof priceCandidate === 'string'
				? Number(priceCandidate)
				: NaN;

	const imageUrl =
		typeof imageCandidate === 'string' && imageCandidate.trim().length > 0
			? imageCandidate
			: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80';

	return {
		id: typeof idCandidate === 'string' && idCandidate.trim().length > 0 ? idCandidate : String(fallbackId),
		brand: typeof brandCandidate === 'string' && brandCandidate.trim().length > 0 ? brandCandidate : 'AutoEssa',
		model: typeof modelCandidate === 'string' && modelCandidate.trim().length > 0 ? modelCandidate : 'Car',
		year: typeof yearCandidate === 'number' ? yearCandidate : 2024,
		price: Number.isFinite(priceNumber) ? priceNumber : 0,
		imageUrl
	};
}

export function mapBookingRequest(item: Record<string, unknown>, fallbackId: number): BookingRequestItem {
	const statusCandidate = item['status'];
	const status =
		typeof statusCandidate === 'number'
			? statusCandidate === 1
				? 'Contacted'
				: statusCandidate === 2
					? 'Closed'
					: 'New'
			: typeof statusCandidate === 'string' && statusCandidate.trim().length > 0
				? statusCandidate
				: 'New';

	const idCandidate = item['id'];
	const id =
		typeof idCandidate === 'number'
			? idCandidate
			: typeof idCandidate === 'string'
				? Number(idCandidate) || fallbackId
				: fallbackId;

	const nestedCar = typeof item['car'] === 'object' && item['car'] !== null
		? (item['car'] as Record<string, unknown>)
		: null;

	const carTitle =
		(typeof item['carTitle'] === 'string' && item['carTitle'].trim().length > 0 ? item['carTitle'] : '') ||
		(typeof item['carName'] === 'string' && item['carName'].trim().length > 0 ? item['carName'] : '') ||
		(typeof item['carModel'] === 'string' && item['carModel'].trim().length > 0 ? item['carModel'] : '') ||
		(typeof nestedCar?.['name'] === 'string' && nestedCar['name'].trim().length > 0 ? nestedCar['name'] : '') ||
		(`${typeof nestedCar?.['brand'] === 'string' ? nestedCar['brand'] : ''} ${typeof nestedCar?.['model'] === 'string' ? nestedCar['model'] : ''}`.trim()) ||
		'Selected car';

	const fromDateRaw =
		(typeof item['fromDate'] === 'string' ? item['fromDate'] : undefined) ??
		(typeof item['startDate'] === 'string' ? item['startDate'] : undefined) ??
		(typeof item['bookingFrom'] === 'string' ? item['bookingFrom'] : undefined) ??
		(typeof item['pickupDate'] === 'string' ? item['pickupDate'] : undefined) ??
		undefined;

	const toDateRaw =
		(typeof item['toDate'] === 'string' ? item['toDate'] : undefined) ??
		(typeof item['endDate'] === 'string' ? item['endDate'] : undefined) ??
		(typeof item['bookingTo'] === 'string' ? item['bookingTo'] : undefined) ??
		(typeof item['dropOffDate'] === 'string' ? item['dropOffDate'] : undefined) ??
		undefined;

	return {
		id,
		carTitle,
		fromDate: normalizeDate(fromDateRaw),
		toDate: normalizeDate(toDateRaw),
		status
	};
}

export function mapCarRequest(item: Record<string, unknown>, fallbackId: number): CarRequestItem {
	const desiredBrand = typeof item['desiredBrand'] === 'string' ? item['desiredBrand'] : '';
	const desiredModel = typeof item['desiredModel'] === 'string' ? item['desiredModel'] : '';
	const preferredBrand = typeof item['preferredBrand'] === 'string' ? item['preferredBrand'] : '';
	const preferredModel = typeof item['preferredModel'] === 'string' ? item['preferredModel'] : '';
	const desiredCarValue = typeof item['desiredCar'] === 'string' ? item['desiredCar'] : '';
	const statusCandidate = item['status'];
	const budgetCandidate = item['budget'];
	const budget =
		typeof budgetCandidate === 'number'
			? budgetCandidate
			: typeof budgetCandidate === 'string'
				? Number(budgetCandidate) || 0
				: 0;

	return {
		id: typeof item['id'] === 'string' && item['id'].trim().length > 0
			? item['id']
			: typeof item['id'] === 'number'
				? item['id']
				: fallbackId,
		customerName: typeof item['fullName'] === 'string' ? item['fullName'] : 'Unknown',
		phoneNumber: typeof item['phoneNumber'] === 'string' ? item['phoneNumber'] : '-',
		desiredCar: `${desiredBrand} ${desiredModel}`.trim() || `${preferredBrand} ${preferredModel}`.trim() || desiredCarValue || 'N/A',
		budget,
		status:
			typeof statusCandidate === 'number'
				? statusCandidate === 1
					? 'Contacted'
					: statusCandidate === 2
						? 'Closed'
						: 'New'
				: typeof statusCandidate === 'string' && statusCandidate.trim().length > 0
					? statusCandidate
					: 'New'
	};
}

