import type { Booking } from '../types/booking';

export const isBooking = (value: unknown): value is Booking => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	return (
		'id' in value &&
		typeof value.id === 'string' &&
		'date' in value &&
		typeof value.date === 'string' &&
		'start' in value &&
		typeof value.start === 'string' &&
		'end' in value &&
		typeof value.end === 'string' &&
		(!('title' in value) || value.title === undefined || typeof value.title === 'string')
	);
};

export const isBookings = (value: unknown): value is Booking[] => {
	return Array.isArray(value) && value.every(isBooking);
};
