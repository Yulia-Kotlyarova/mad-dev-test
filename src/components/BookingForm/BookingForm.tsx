import { memo, useCallback, useState } from 'react';
import type { SubmitEvent } from 'react';
import { ValidationError } from 'yup';

import type { Booking, BookingInput } from '../../types/booking';
import { isPastDate } from '../../utils/time';

import styles from './BookingForm.module.css';

type FormValues = Pick<BookingInput, 'start' | 'end' | 'title'>;
type FormField = keyof FormValues;
type FormErrors = Partial<Record<FormField | 'form', string>>;

type BookingFormProps = {
	date: string;
	booking?: Booking | null;
	bookings: Booking[];
	isSubmitting: boolean;
	error?: string | null;
	validate: (input: BookingInput, bookings: Booking[], editingId?: string) => Promise<void>;
	onSubmit: (input: BookingInput) => Promise<boolean>;
	onCancel?: () => void;
};

const DEFAULT_VALUES: FormValues = {
	title: '',
	start: '09:00',
	end: '09:30',
};

function getInitialValues(booking?: Booking | null): FormValues {
	if (!booking) return { ...DEFAULT_VALUES };

	return {
		title: booking.title ?? '',
		start: booking.start,
		end: booking.end,
	};
}

function BookingFormComponent({
	date,
	booking,
	bookings,
	isSubmitting,
	error,
	validate,
	onSubmit,
	onCancel,
}: BookingFormProps) {
	const [values, setValues] = useState<FormValues>(() => getInitialValues(booking));

	const [errors, setErrors] = useState<FormErrors>({});

	const isEditing = Boolean(booking);
	const isPast = isPastDate(date);
	const isDisabled = isSubmitting || isPast;

	const handleChange = useCallback((field: FormField, value: string) => {
		setValues((previous) => ({
			...previous,
			[field]: value,
		}));

		setErrors((previous) => ({
			...previous,
			[field]: undefined,
			form: undefined,
		}));
	}, []);

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (isDisabled) return;
		console.log('handleSubmit date', date);

		const input: BookingInput = {
			date,
			start: values.start,
			end: values.end,
			title: values.title?.trim() || undefined,
		};

		setErrors({});

		try {
			await validate(input, bookings, booking?.id);
		} catch (error: unknown) {
			if (error instanceof ValidationError) {
				const nextErrors: FormErrors = {};

				for (const issue of error.inner.length ? error.inner : [error]) {
					const field = issue.path as FormField | undefined;

					if (field && field in values) {
						nextErrors[field] ??= issue.message;
					} else {
						nextErrors.form ??= issue.message;
					}
				}

				setErrors(nextErrors);
				return;
			}

			setErrors({
				form: 'Не удалось проверить данные. Попробуйте ещё раз.',
			});

			return;
		}

		try {
			const isSuccess = await onSubmit(input);

			if (!isSuccess) return;

			if (!booking) {
				setValues({ ...DEFAULT_VALUES });
				setErrors({});
			}
		} catch {
			setErrors({
				form: 'Не удалось сохранить бронирование. Попробуйте ещё раз.',
			});
		}
	};

	return (
		<form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
			<h2 className={styles.heading}>
				{isEditing ? 'Редактирование бронирования' : 'Новое бронирование'}
			</h2>

			<p className={styles.date}>
				Дата: <time dateTime={date}>{date}</time>
			</p>

			{isPast && (
				<p className={styles.error} role="alert">
					Нельзя бронировать прошедшую дату.
				</p>
			)}

			{errors.form && (
				<p className={styles.error} role="alert">
					{errors.form}
				</p>
			)}

			{error && (
				<p className={styles.error} role="alert">
					{error}
				</p>
			)}

			<fieldset className={styles.fields} disabled={isDisabled}>
				<div className={styles.field}>
					<label htmlFor="booking-title">Название</label>

					<input
						id="booking-title"
						name="title"
						type="text"
						value={values.title ?? ''}
						maxLength={100}
						placeholder="Например, встреча команды"
						aria-invalid={Boolean(errors.title)}
						aria-describedby={errors.title ? 'booking-title-error' : undefined}
						onChange={(event) => handleChange('title', event.target.value)}
					/>

					{errors.title && (
						<span id="booking-title-error" className={styles.error}>
							{errors.title}
						</span>
					)}
				</div>

				<div className={styles.timeFields}>
					<div className={styles.field}>
						<label htmlFor="booking-start">Начало</label>

						<input
							id="booking-start"
							name="start"
							type="time"
							min="09:00"
							max="18:00"
							step={1800}
							required
							value={values.start}
							aria-invalid={Boolean(errors.start)}
							aria-describedby={errors.start ? 'booking-start-error' : undefined}
							onChange={(event) => handleChange('start', event.target.value)}
						/>

						{errors.start && (
							<span id="booking-start-error" className={styles.error}>
								{errors.start}
							</span>
						)}
					</div>

					<div className={styles.field}>
						<label htmlFor="booking-end">Окончание</label>

						<input
							id="booking-end"
							name="end"
							type="time"
							min="09:00"
							max="18:00"
							step={1800}
							required
							value={values.end}
							aria-invalid={Boolean(errors.end)}
							aria-describedby={errors.end ? 'booking-end-error' : undefined}
							onChange={(event) => handleChange('end', event.target.value)}
						/>

						{errors.end && (
							<span id="booking-end-error" className={styles.error}>
								{errors.end}
							</span>
						)}
					</div>
				</div>
			</fieldset>

			<p className={styles.hint}>
				Рабочее время: 09:00–18:00. Продолжительность: от 30 минут до 2 часов.
			</p>

			<div className={styles.actions}>
				{isEditing && onCancel && (
					<button
						type="button"
						className={styles.cancelButton}
						disabled={isSubmitting}
						onClick={onCancel}
					>
						Отмена
					</button>
				)}

				<button
					type="submit"
					className={styles.submitButton}
					disabled={isDisabled}
					aria-busy={isSubmitting}
				>
					{isSubmitting ? 'Сохранение...' : isEditing ? 'Сохранить изменения' : 'Забронировать'}
				</button>
			</div>
		</form>
	);
}

export const BookingForm = memo(BookingFormComponent);
