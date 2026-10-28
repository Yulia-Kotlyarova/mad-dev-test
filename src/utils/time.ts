const MINUTES_IN_HOUR = 60;

/**
 * Преобразует время HH:mm в количество минут с начала суток.
 * Например, "09:30" → 570.
 */
const timeToMinutes = (time: string): number => {
	const [hours, minutes] = time.split(':').map(Number);

	return hours * MINUTES_IN_HOUR + minutes;
};

/**
 * Проверяет пересечение двух временных интервалов.
 * Касание границ не считается пересечением.
 */
const isTimeOverlapping = (start1: string, end1: string, start2: string, end2: string): boolean => {
	return timeToMinutes(start1) < timeToMinutes(end2) && timeToMinutes(end1) > timeToMinutes(start2);
};

/**
 * Возвращает текущую дату в локальном формате YYYY-MM-DD.
 */
const getTodayDate = (): string => {
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
};

/**
 * Проверяет, является ли дата прошедшей.
 */
const isPastDate = (date: string): boolean => {
	return date < getTodayDate();
};

/**
 * Проверяет, находится ли указанное время в прошлом.
 * Для будущих дат возвращает false.
 */
const isPastTime = (date: string, time: string): boolean => {
	if (isPastDate(date)) {
		return true;
	}

	if (date > getTodayDate()) {
		return false;
	}

	const now = new Date();

	const currentMinutes = now.getHours() * MINUTES_IN_HOUR + now.getMinutes();

	return timeToMinutes(time) <= currentMinutes;
};

export { timeToMinutes, isTimeOverlapping, isPastTime, isPastDate, getTodayDate };
