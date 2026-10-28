import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTodayDate, isPastDate, isPastTime, isTimeOverlapping, timeToMinutes } from '../time';

import { mockDate, mockTime } from './mocks';

describe('timeToMinutes', () => {
	it.each(mockTime.conversion)('converts $time to $expected minutes', ({ time, expected }) => {
		expect(timeToMinutes(time)).toBe(expected);
	});
});

describe('isTimeOverlapping', () => {
	it.each(mockTime.intervals)('$name', ({ first, second, expected }) => {
		expect(isTimeOverlapping(first[0], first[1], second[0], second[1])).toBe(expected);
	});
});

describe('date and time utilities', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(mockDate.current);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('getTodayDate', () => {
		it('returns the current local date', () => {
			expect(getTodayDate()).toBe(mockDate.today);
		});

		it('adds leading zeros to month and day', () => {
			vi.setSystemTime(mockDate.singleDigitDate);

			expect(getTodayDate()).toBe('2026-01-05');
		});

		it('returns the same date at the beginning of the day', () => {
			vi.setSystemTime(mockDate.startOfDay);

			expect(getTodayDate()).toBe(mockDate.today);
		});

		it('returns the same date at the end of the day', () => {
			vi.setSystemTime(mockDate.endOfDay);

			expect(getTodayDate()).toBe(mockDate.today);
		});

		it('handles transition to the next year', () => {
			vi.setSystemTime(mockDate.endOfYear);

			expect(getTodayDate()).toBe('2026-12-31');

			vi.setSystemTime(mockDate.startOfYear);

			expect(getTodayDate()).toBe('2027-01-01');
		});
	});

	describe('isPastDate', () => {
		it('returns true for yesterday', () => {
			expect(isPastDate(mockDate.yesterday)).toBe(true);
		});

		it('returns false for today', () => {
			expect(isPastDate(mockDate.today)).toBe(false);
		});

		it('returns false for tomorrow', () => {
			expect(isPastDate(mockDate.tomorrow)).toBe(false);
		});

		it('handles dates across year boundaries', () => {
			vi.setSystemTime(mockDate.startOfYear);

			expect(isPastDate('2026-12-31')).toBe(true);
			expect(isPastDate('2027-01-01')).toBe(false);
			expect(isPastDate('2027-01-02')).toBe(false);
		});
	});

	describe('isPastTime', () => {
		it('returns true for any time on a past date', () => {
			expect(isPastTime(mockDate.yesterday, '17:00')).toBe(true);
		});

		it('returns false for any time on a future date', () => {
			expect(isPastTime(mockDate.tomorrow, '09:00')).toBe(false);
		});

		it('returns true for an earlier time today', () => {
			expect(isPastTime(mockDate.today, '12:00')).toBe(true);
		});

		it('returns true for the current minute', () => {
			expect(isPastTime(mockDate.today, '12:30')).toBe(true);
		});

		it('returns false for the next minute', () => {
			expect(isPastTime(mockDate.today, '12:31')).toBe(false);
		});

		it('returns false for a later time today', () => {
			expect(isPastTime(mockDate.today, '17:00')).toBe(false);
		});

		it('rejects midnight when the current day has started', () => {
			vi.setSystemTime(mockDate.startOfDay);

			expect(isPastTime(mockDate.today, '00:00')).toBe(true);
			expect(isPastTime(mockDate.today, '00:01')).toBe(false);
		});

		it('handles the transition to the next day', () => {
			vi.setSystemTime(mockDate.endOfDay);

			expect(isPastTime(mockDate.today, '23:59')).toBe(true);
			expect(isPastTime(mockDate.tomorrow, '00:00')).toBe(false);
		});
	});
});
