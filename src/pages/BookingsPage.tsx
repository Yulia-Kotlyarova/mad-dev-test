import { BookingForm } from '../components/BookingForm/BookingForm';
import { BookingList } from '../components/BookingList/BookingList';
import { DateSelector } from '../components/DateSelector/DateSelector';
import { useBookings } from '../utils/useBookings';

import styles from './BookingsPage.module.css';
import { validateBooking } from '../features/bookings/validation/bookingSchema.ts';

export const BookingsPage = () => {
	const {
		date,
		setDate,
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
	} = useBookings();

	return (
		<main className={styles.page}>
			<div className={styles.container}>
				<header>
					<h1 className="text-2xl font-semibold">Бронирование переговорной</h1>

					<p className="mt-2 text-gray-600">Рабочее время: 09:00–18:00</p>
				</header>

				<section aria-label="Бронирования на выбранную дату" className="mt-8 flex flex-col gap-6">
					<DateSelector value={date} onChange={setDate} />

					{isLoading ? (
						<p role="status" aria-live="polite">
							Загрузка бронирований...
						</p>
					) : error ? (
						<div role="alert" className="flex flex-col gap-3">
							<p className="text-red-600">{error}</p>

							<button
								type="button"
								onClick={() => void reload()}
								className="w-fit rounded-lg border px-4 py-2"
							>
								Повторить запрос
							</button>
						</div>
					) : (
						<BookingList
							bookings={bookings}
							deletingId={deletingId}
							isLoading={isLoading}
							onEdit={startEditing}
							onDelete={deleteBooking}
						/>
					)}
				</section>

				<section aria-label="Форма бронирования" className="mt-8">
					<BookingForm
						key={`${date}-${editingBooking?.id ?? 'new'}`}
						date={date}
						booking={editingBooking}
						bookings={bookings}
						isSubmitting={isSubmitting}
						error={formError}
						validate={validateBooking}
						onSubmit={submitBooking}
						onCancel={cancelEditing}
					/>
				</section>
			</div>
		</main>
	);
};
