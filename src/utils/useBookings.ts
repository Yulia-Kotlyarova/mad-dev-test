import { useCallback, useEffect, useRef, useState } from 'react';

import { bookingsApi } from '../api/bookingsApi';
import type { Booking, BookingInput } from '../types/booking';
import { getTodayDate } from './time';

const getErrorMessage = (error: unknown): string => {
	if (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		return error.message;
	}

	return 'Произошла ошибка. Попробуйте ещё раз.';
};

const isConflictError = (error: unknown): boolean => {
	return typeof error === 'object' && error !== null && 'status' in error && error.status === 409;
};

export const useBookings = () => {
	const [date, setDate] = useState(getTodayDate);
	console.log('date', date);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);

	const requestId = useRef(0);
	const mutationInProgress = useRef(false);
	const dateRef = useRef(date);

	const reload = useCallback(async () => {
		const currentRequestId = ++requestId.current;

		setIsLoading(true);
		setError(null);

		try {
			const data = await bookingsApi.getBookings(date);

			if (currentRequestId !== requestId.current) return;

			setBookings(data);
		} catch (error: unknown) {
			if (currentRequestId !== requestId.current) return;

			setError(getErrorMessage(error));
		} finally {
			if (currentRequestId === requestId.current) {
				setIsLoading(false);
			}
		}
	}, [date]);

	useEffect(() => {
		const currentRequestId = ++requestId.current;
		let cancelled = false;

		const loadBookings = async () => {
			try {
				const data = await bookingsApi.getBookings(date);

				if (cancelled || currentRequestId !== requestId.current) {
					return;
				}

				setBookings(data);
				setError(null);
			} catch (error: unknown) {
				if (cancelled || currentRequestId !== requestId.current) {
					return;
				}

				setError(getErrorMessage(error));
			} finally {
				if (!cancelled && currentRequestId === requestId.current) {
					setIsLoading(false);
				}
			}
		};

		void loadBookings();

		return () => {
			cancelled = true;
			requestId.current += 1;
		};
	}, [date]);

	const changeDate = useCallback((nextDate: string) => {
		if (dateRef.current === nextDate) return;

		dateRef.current = nextDate;
		requestId.current += 1;

		setDate(nextDate);
		setEditingBooking(null);
		setFormError(null);
		setError(null);
		setIsLoading(true);
	}, []);

	const startEditing = useCallback((booking: Booking) => {
		setEditingBooking(booking);
		setFormError(null);
	}, []);

	const cancelEditing = useCallback(() => {
		setEditingBooking(null);
		setFormError(null);
	}, []);

	const submitBooking = useCallback(
		async (input: BookingInput): Promise<boolean> => {
			if (mutationInProgress.current) return false;

			mutationInProgress.current = true;

			setIsSubmitting(true);
			setFormError(null);

			const submittedDate = date;
			const bookingId = editingBooking?.id;

			try {
				if (bookingId) {
					await bookingsApi.updateBooking(bookingId, input);
				} else {
					await bookingsApi.createBooking(input);
				}

				if (dateRef.current === submittedDate) {
					setEditingBooking(null);
					await reload();
				}

				return true;
			} catch (error: unknown) {
				if (dateRef.current === submittedDate) {
					setFormError(getErrorMessage(error));

					if (isConflictError(error)) {
						await reload();
					}
				}

				return false;
			} finally {
				mutationInProgress.current = false;
				setIsSubmitting(false);
			}
		},
		[date, editingBooking, reload],
	);

	const deleteBooking = useCallback(
		async (id: string): Promise<void> => {
			if (mutationInProgress.current) return;

			const confirmed = window.confirm('Вы уверены, что хотите удалить бронирование?');

			if (!confirmed) return;

			mutationInProgress.current = true;

			setDeletingId(id);
			setError(null);

			const submittedDate = date;

			try {
				await bookingsApi.deleteBooking(id);

				if (dateRef.current === submittedDate) {
					setEditingBooking((current) => (current?.id === id ? null : current));

					await reload();
				}
			} catch (error: unknown) {
				if (dateRef.current === submittedDate) {
					setError(getErrorMessage(error));
				}
			} finally {
				mutationInProgress.current = false;
				setDeletingId(null);
			}
		},
		[date, reload],
	);

	return {
		date,
		setDate: changeDate,

		bookings,
		editingBooking,

		isLoading,
		isSubmitting,
		deletingId,

		error,
		formError,

		reload,
		startEditing,
		cancelEditing,
		submitBooking,
		deleteBooking,
	};
};
