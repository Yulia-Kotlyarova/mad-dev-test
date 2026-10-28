import type { BookingsApi, BookingUpdateInput } from '../types/bookingsApi';
import type { Booking, BookingInput } from '../types/booking';
import { mockServer } from './mockServer';
import { isBookings } from './bookingResponseSchema.ts';

export const bookingsApi: BookingsApi = {
	// replace with real url example
	// async getBookings(date: string): Promise<Booking[]> {
	// 	const response = await fetch(
	// 		`/api/bookings?date=${encodeURIComponent(date)}`,
	// 	);
	//
	// 	if (!response.ok) {
	// 		throw new Error('Не удалось загрузить бронирования');
	// 	}
	//
	// 	return response.json() as Promise<Booking[]>;
	// }
	async getBookings(date: string): Promise<Booking[]> {
		const response: unknown = await mockServer.getBookings(date);

		if (!isBookings(response)) {
			throw new Error('Сервер вернул некорректный список бронирований');
		}

		return response;
	},

	createBooking(input: BookingInput): Promise<Booking> {
		return mockServer.createBooking(input);
	},

	updateBooking(id: string, input: BookingUpdateInput): Promise<Booking> {
		return mockServer.updateBooking(id, input);
	},

	deleteBooking(id: string): Promise<void> {
		return mockServer.deleteBooking(id);
	},
};

// TODO добавить runtime-валидация ответа, в том числе типов
