import { BookingRequestItem, FavoriteCarItem } from '../data-access/user.interface';
import { normalizeDate } from './user.helpers';

export function mapFavorite(item: Record<string, unknown>, fallbackId: number): FavoriteCarItem {
	return {
		id: typeof item['id'] === 'number' ? item['id'] : fallbackId,
		brand: typeof item['brand'] === 'string' ? item['brand'] : 'AutoEssa',
		model: typeof item['model'] === 'string' ? item['model'] : 'Car',
		year: typeof item['year'] === 'number' ? item['year'] : 2024,
		price: typeof item['price'] === 'number' ? item['price'] : 0
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

