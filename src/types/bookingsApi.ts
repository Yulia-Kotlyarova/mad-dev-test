import type { Booking, BookingInput } from './booking';

export type BookingUpdateInput = Partial<BookingInput>;

export interface BookingsApi {
	getBookings(date: string): Promise<Booking[]>;

	createBooking(data: BookingInput): Promise<Booking>;

	updateBooking(id: string, data: BookingUpdateInput): Promise<Booking>;

	deleteBooking(id: string): Promise<void>;
}
