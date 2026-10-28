import * as yup from 'yup';

import type { Booking, BookingInput } from '../../../types/booking';
import { timeToMinutes } from '../../../utils/time';
import { hasBookingConflict } from './bookingRules';

const WORK_START = 9 * 60;
const WORK_END = 18 * 60;

const MIN_DURATION = 30;
const MAX_DURATION = 120;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

type ValidationOptions = {
	bookings: Booking[];
	excludeBookingId?: string;
};

export const createBookingSchema = ({ bookings, excludeBookingId }: ValidationOptions) =>
	yup
		.object({
			title: yup.string().trim().max(100, 'Максимум 100 символов'),

			date: yup
				.string()
				.required('Выберите дату')
				.matches(/^\d{4}-\d{2}-\d{2}$/, 'Некорректная дата')
				.test('valid-date', 'Некорректная дата', (value) => {
					if (!value) return false;

					const date = new Date(`${value}T00:00:00`);

					return (
						!Number.isNaN(date.getTime()) &&
						date.getFullYear() === Number(value.slice(0, 4)) &&
						date.getMonth() + 1 === Number(value.slice(5, 7)) &&
						date.getDate() === Number(value.slice(8, 10))
					);
				}),

			start: yup
				.string()
				.required('Укажите время начала')
				.matches(TIME_PATTERN, 'Некорректное время'),

			end: yup
				.string()
				.required('Укажите время окончания')
				.matches(TIME_PATTERN, 'Некорректное время'),
		})
		.test('booking-rules', function (value) {
			if (
				!value.date ||
				!TIME_PATTERN.test(value.start ?? '') ||
				!TIME_PATTERN.test(value.end ?? '')
			) {
				return true;
			}

			const start = timeToMinutes(value.start!);
			const end = timeToMinutes(value.end!);

			const error = (path: 'date' | 'start' | 'end', message: string) =>
				this.createError({ path, message });

			if (start < WORK_START || start >= WORK_END) {
				return error('start', 'Начало должно быть с 09:00 до 18:00');
			}

			if (end > WORK_END || end <= WORK_START) {
				return error('end', 'Окончание должно быть с 09:00 до 18:00');
			}

			if (start >= end) {
				return error('end', 'Окончание должно быть позже начала');
			}

			const duration = end - start;

			if (duration < MIN_DURATION) {
				return error('end', 'Минимальная длительность — 30 минут');
			}

			if (duration > MAX_DURATION) {
				return error('end', 'Максимальная длительность — 2 часа');
			}

			const now = new Date();

			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');

			const today = `${year}-${month}-${day}`;

			if (value.date < today) {
				return error('date', 'Нельзя бронировать прошедшую дату');
			}

			if (value.date === today && start <= now.getHours() * 60 + now.getMinutes()) {
				return error('start', 'Нельзя бронировать прошедшее время');
			}

			const sameDayBookings = bookings.filter((booking) => booking.date === value.date);

			if (
				hasBookingConflict(
					{ start: value.start!, end: value.end! },
					sameDayBookings,
					excludeBookingId,
				)
			) {
				return error('start', 'Это время уже занято');
			}

			return true;
		});

export const validateBooking = async (
	input: BookingInput,
	bookings: Booking[],
	editingId?: string,
): Promise<void> => {
	const schema = createBookingSchema({
		bookings,
		excludeBookingId: editingId,
	});

	await schema.validate(input, {
		abortEarly: false,
	});
};

export type BookingFormValues = yup.InferType<ReturnType<typeof createBookingSchema>>;
