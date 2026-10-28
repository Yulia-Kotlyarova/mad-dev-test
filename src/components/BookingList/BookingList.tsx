import { memo } from 'react';

import type { Booking } from '../../types/booking';
import { BookingItem } from '../BookingItem/BookingItem';

type BookingListProps = {
	bookings: Booking[];
	isLoading: boolean;
	deletingId: string | null;
	onEdit: (booking: Booking) => void;
	onDelete: (id: string) => void;
};

export const BookingList = memo(
	({ bookings, isLoading, deletingId, onEdit, onDelete }: BookingListProps) => {
		if (isLoading) {
			return <p role="status">Загрузка бронирований…</p>;
		}

		if (bookings.length === 0) {
			return <p>На выбранную дату бронирований нет.</p>;
		}

		return (
			<ul className="space-y-3" aria-label="Список бронирований">
				{bookings.map((booking) => (
					<BookingItem
						key={booking.id}
						booking={booking}
						onEdit={onEdit}
						onDelete={onDelete}
						isDeleting={deletingId === booking.id}
						disabled={deletingId !== null}
					/>
				))}
			</ul>
		);
	},
);
