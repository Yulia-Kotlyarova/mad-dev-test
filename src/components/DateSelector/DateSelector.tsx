import { getTodayDate } from '../../utils/time.ts';

type DateSelectorProps = {
	value: string;
	onChange: (date: string) => void;
};

// TODO memo
export const DateSelector = ({ value, onChange }: DateSelectorProps) => {
	return (
		<div className="flex flex-col gap-2">
			<label htmlFor="booking-date" className="font-medium">
				Дата бронирования
			</label>

			<input
				id="booking-date"
				type="date"
				value={value}
				min={getTodayDate()}
				onChange={(event) => onChange(event.target.value)}
				className="rounded-lg border border-gray-300 px-3 py-2"
			/>
		</div>
	);
};
