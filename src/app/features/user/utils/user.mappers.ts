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
	return {
		id: typeof item['id'] === 'number' ? item['id'] : fallbackId,
		carTitle: typeof item['carTitle'] === 'string' ? item['carTitle'] : 'Selected car',
		fromDate: normalizeDate(typeof item['fromDate'] === 'string' ? item['fromDate'] : undefined),
		toDate: normalizeDate(typeof item['toDate'] === 'string' ? item['toDate'] : undefined),
		status: typeof item['status'] === 'string' ? item['status'] : 'New'
	};
}

export function mapCarRequest(item: Record<string, unknown>, fallbackId: number): CarRequestItem {
	const desiredBrand = typeof item['desiredBrand'] === 'string' ? item['desiredBrand'] : '';
	const desiredModel = typeof item['desiredModel'] === 'string' ? item['desiredModel'] : '';
	const desiredCarValue = typeof item['desiredCar'] === 'string' ? item['desiredCar'] : '';
	const statusCandidate = item['status'];

	return {
		id: typeof item['id'] === 'string' && item['id'].trim().length > 0
			? item['id']
			: typeof item['id'] === 'number'
				? item['id']
				: fallbackId,
		customerName: typeof item['fullName'] === 'string' ? item['fullName'] : 'Unknown',
		phoneNumber: typeof item['phoneNumber'] === 'string' ? item['phoneNumber'] : '-',
		desiredCar: `${desiredBrand} ${desiredModel}`.trim() || desiredCarValue || 'N/A',
		budget: typeof item['budget'] === 'number' ? item['budget'] : 0,
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

