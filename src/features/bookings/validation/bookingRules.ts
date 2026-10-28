import type { Booking } from '../../../types/booking';
import { timeToMinutes } from '../../../utils/time';

type BookingInterval = Pick<Booking, 'start' | 'end'>;

export const hasBookingConflict = (
	interval: BookingInterval,
	bookings: Booking[],
	excludeBookingId?: string,
): boolean => {
	const start = timeToMinutes(interval.start);
	const end = timeToMinutes(interval.end);

	return bookings.some((booking) => {
		if (booking.id === excludeBookingId) {
			return false;
		}

		const bookingStart = timeToMinutes(booking.start);
		const bookingEnd = timeToMinutes(booking.end);

		return start < bookingEnd && end > bookingStart;
	});
};
