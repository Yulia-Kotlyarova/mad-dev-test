import type { ApiError, ApiErrorCode, Booking, BookingInput } from '../types/booking';
import type { BookingsApi } from '../types/bookingsApi';
import { isPastDate, isPastTime, isTimeOverlapping, timeToMinutes } from '../utils/time';

const WORK_START = 9 * 60;
const WORK_END = 18 * 60;
const MIN_DURATION = 30;
const MAX_DURATION = 120;

const NETWORK_DELAY = 400;

const bookings = new Map<string, Booking>();

type MockServerError = Error & ApiError;

function createApiError(status: number, code: ApiErrorCode, message: string): MockServerError {
	return Object.assign(new Error(message), {
		name: 'ApiError',
		status,
		code,
	});
}

const delay = (ms = NETWORK_DELAY): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

function validateBooking(input: BookingInput, excludeId?: string): void {
	const { date, start, end } = input;

	if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00`))) {
		throw createApiError(400, 'VALIDATION_ERROR', 'Некорректная дата бронирования');
	}

	if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
		throw createApiError(400, 'VALIDATION_ERROR', 'Укажите время в формате HH:mm');
	}

	const startMinutes = timeToMinutes(start);
	const endMinutes = timeToMinutes(end);

	if (
		!Number.isInteger(startMinutes) ||
		!Number.isInteger(endMinutes) ||
		startMinutes < 0 ||
		endMinutes > 24 * 60
	) {
		throw createApiError(400, 'VALIDATION_ERROR', 'Некорректное время бронирования');
	}

	if (startMinutes < WORK_START || endMinutes > WORK_END) {
		throw createApiError(400, 'VALIDATION_ERROR', 'Бронирование доступно с 09:00 до 18:00');
	}

	const duration = endMinutes - startMinutes;

	if (duration <= 0) {
		throw createApiError(400, 'VALIDATION_ERROR', 'Время окончания должно быть позже начала');
	}

	if (duration < MIN_DURATION || duration > MAX_DURATION) {
		throw createApiError(
			400,
			'VALIDATION_ERROR',
			'Длительность бронирования — от 30 минут до 2 часов',
		);
	}

	if (isPastDate(date) || isPastTime(date, start)) {
		throw createApiError(400, 'VALIDATION_ERROR', 'Нельзя бронировать прошедшее время');
	}

	const hasConflict = [...bookings.values()].some(
		(booking) =>
			booking.id !== excludeId &&
			booking.date === date &&
			isTimeOverlapping(start, end, booking.start, booking.end),
	);

	if (hasConflict) {
		throw createApiError(409, 'CONFLICT', 'Это время уже занято. Обновите список бронирований.');
	}
}

function getBookingOrThrow(id: string): Booking {
	const booking = bookings.get(id);

	if (!booking) {
		throw createApiError(404, 'NOT_FOUND', 'Бронирование не найдено');
	}

	return booking;
}

function saveBooking(input: BookingInput): Booking {
	const booking: Booking = {
		...input,
		id: crypto.randomUUID(),
	};

	bookings.set(booking.id, booking);

	return { ...booking };
}

export const mockServer: BookingsApi = {
	async getBookings(date) {
		await delay();

		return [...bookings.values()]
			.filter((booking) => booking.date === date)
			.sort((a, b) => a.start.localeCompare(b.start))
			.map((booking) => ({ ...booking }));
	},

	async createBooking(input) {
		await delay();
		//* test 409 error
		// const simulateConflict = true;
		//
		// if (simulateConflict) {
		// 	const competingBooking: Booking = {
		// 		...input,
		// 		id: crypto.randomUUID(),
		// 		title: 'Бронирование другого пользователя',
		// 	};
		//
		// 	bookings.set(competingBooking.id, competingBooking);
		// }

		validateBooking(input);

		return saveBooking(input);
	},

	async updateBooking(id, input) {
		await delay();

		const currentBooking = getBookingOrThrow(id);

		const updatedBooking: Booking = {
			...currentBooking,
			...input,
			id,
		};

		validateBooking(updatedBooking, id);

		bookings.set(id, updatedBooking);

		return { ...updatedBooking };
	},

	async deleteBooking(id) {
		await delay();

		getBookingOrThrow(id);

		bookings.delete(id);
	},
};

/**
 * Имитирует бронирование, созданное другим пользователем.
 * Используется только в разработке и тестах.
 */
export function simulateConcurrentBooking(input: BookingInput): Booking {
	validateBooking(input);

	return saveBooking(input);
}

/**
 * Сбрасывает состояние mock-сервера между тестами.
 */
export function resetMockServer(): void {
	bookings.clear();
}
