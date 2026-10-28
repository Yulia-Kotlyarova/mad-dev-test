import { memo } from 'react';

import type { Booking } from '../../types/booking';

type BookingItemProps = {
	booking: Booking;
	onEdit: (booking: Booking) => void;
	onDelete: (id: string) => void;
	isDeleting: boolean;
	disabled?: boolean;
};

export const BookingItem = memo(
	({ booking, onEdit, onDelete, isDeleting, disabled = false }: BookingItemProps) => {
		return (
			<li className="flex items-center justify-between gap-4 rounded-lg border p-4">
				<div className="min-w-0">
					<p className="font-medium">{booking.title || 'Без названия'}</p>

					<p className="text-sm text-gray-500">
						{booking.start}–{booking.end}
					</p>
				</div>

				<div className="flex shrink-0 gap-2">
					<button
						type="button"
						onClick={() => onEdit(booking)}
						disabled={disabled || isDeleting}
						className="rounded border px-3 py-2 disabled:opacity-50"
						aria-label={`Редактировать бронь ${booking.start}–${booking.end}`}
					>
						Изменить
					</button>

					<button
						type="button"
						onClick={() => onDelete(booking.id)}
						disabled={disabled || isDeleting}
						className="rounded border border-red-300 px-3 py-2 text-red-600 disabled:opacity-50"
						aria-label={`Удалить бронь ${booking.start}–${booking.end}`}
					>
						{isDeleting ? 'Удаление…' : 'Удалить'}
					</button>
				</div>
			</li>
		);
	},
);
