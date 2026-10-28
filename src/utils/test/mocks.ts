export const mockDate = {
	current: new Date(2026, 5, 15, 12, 30, 45),

	today: '2026-06-15',
	yesterday: '2026-06-14',
	tomorrow: '2026-06-16',

	startOfDay: new Date(2026, 5, 15, 0, 0),
	endOfDay: new Date(2026, 5, 15, 23, 59),

	endOfYear: new Date(2026, 11, 31, 23, 59),
	startOfYear: new Date(2027, 0, 1, 0, 0),

	singleDigitDate: new Date(2026, 0, 5, 9, 0),
} as const;

export const mockTime = {
	conversion: [
		{ time: '00:00', expected: 0 },
		{ time: '09:00', expected: 540 },
		{ time: '09:30', expected: 570 },
		{ time: '12:00', expected: 720 },
		{ time: '18:00', expected: 1080 },
		{ time: '23:59', expected: 1439 },
	],

	intervals: [
		{
			name: 'частично пересекающиеся интервалы',
			first: ['10:00', '11:00'],
			second: ['10:30', '11:30'],
			expected: true,
		},
		{
			name: 'касание правой границы',
			first: ['10:00', '11:00'],
			second: ['11:00', '12:00'],
			expected: false,
		},
		{
			name: 'касание левой границы',
			first: ['11:00', '12:00'],
			second: ['10:00', '11:00'],
			expected: false,
		},
		{
			name: 'непересекающиеся интервалы',
			first: ['09:00', '10:00'],
			second: ['12:00', '13:00'],
			expected: false,
		},
		{
			name: 'полностью одинаковые интервалы',
			first: ['10:00', '11:00'],
			second: ['10:00', '11:00'],
			expected: true,
		},
		{
			name: 'первый интервал содержит второй',
			first: ['10:00', '14:00'],
			second: ['11:00', '12:00'],
			expected: true,
		},
		{
			name: 'второй интервал содержит первый',
			first: ['11:00', '12:00'],
			second: ['10:00', '14:00'],
			expected: true,
		},
		{
			name: 'пересечение в одну минуту',
			first: ['10:00', '11:00'],
			second: ['10:59', '12:00'],
			expected: true,
		},
	],
} as const;
