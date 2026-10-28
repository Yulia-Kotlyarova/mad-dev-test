export type Booking = {
	id: string;
	date: string; // YYYY-MM-DD
	start: string; // HH:mm
	end: string; // HH:mm
	title?: string;
};

export type BookingInput = Omit<Booking, 'id'>;

export type ApiErrorCode = 'VALIDATION_ERROR' | 'CONFLICT' | 'NOT_FOUND' | 'SERVER_ERROR';

export type ApiError = {
	status: number;
	code: ApiErrorCode;
	message: string;
};
