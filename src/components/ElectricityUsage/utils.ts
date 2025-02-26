import { PowerData, ProcessedData} from './types';

export const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const calculateAverages = {
    yearly: (data: PowerData, year: string): ProcessedData => {
        const monthlyAverages = Array(12).fill(0);
        const monthCounts = Array(12).fill(0);

        Object.entries(data).forEach(([date, hours]) => {
            if (date.startsWith(year)) {
                const month = parseInt(date.split('-')[1]) - 1;
                Object.values(hours).forEach(minutes => {
                    Object.values(minutes).forEach(power => {
                        monthlyAverages[month] += power;
                        monthCounts[month]++;
                    });
                });
            }
        });

        const values = monthlyAverages.map((total, index) =>
            monthCounts[index] ? total / monthCounts[index] : 0
        );

        return {
            labels: monthNames,
            values
        };
    },

    monthly: (data: PowerData, year: string, month: string): ProcessedData => {
        const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
        const dailyAverages = Array(daysInMonth).fill(0);
        const dayCounts = Array(daysInMonth).fill(0);

        const monthStr = month.padStart(2, '0');

        Object.entries(data).forEach(([date, hours]) => {
            if (date.startsWith(`${year}-${monthStr}`)) {
                const day = parseInt(date.split('-')[2]) - 1;
                Object.values(hours).forEach(minutes => {
                    Object.values(minutes).forEach(power => {
                        dailyAverages[day] += power;
                        dayCounts[day]++;
                    });
                });
            }
        });

        const values = dailyAverages.map((total, index) =>
            dayCounts[index] ? total / dayCounts[index] : 0
        );

        return {
            labels: Array.from({length: daysInMonth}, (_, i) => `${i + 1}`),
            values
        };
    },

    daily: (data: PowerData, date: string): ProcessedData => {
        const hourlyAverages = Array(24).fill(0);
        const hourCounts = Array(24).fill(0);

        if (data[date]) {
            Object.entries(data[date]).forEach(([hour, minutes]) => {
                const hourIndex = parseInt(hour);
                Object.values(minutes).forEach(power => {
                    hourlyAverages[hourIndex] += power;
                    hourCounts[hourIndex]++;
                });
            });
        }

        const values = hourlyAverages.map((total, index) =>
            hourCounts[index] ? total / hourCounts[index] : 0
        );

        return {
            labels: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
            values
        };
    },

    hourly: (data: PowerData, date: string, hour: string): ProcessedData => {
        const minuteValues = Array(60).fill(0);

        if (data[date]?.[hour]) {
            Object.entries(data[date][hour]).forEach(([minute, power]) => {
                const minuteIndex = parseInt(minute);
                minuteValues[minuteIndex] = power;
            });
        }

        return {
            labels: Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')),
            values: minuteValues
        };
    }
};

export const getAvailableYears = (data: PowerData): string[] => {
    const years = new Set<string>();
    Object.keys(data).forEach(date => {
        years.add(date.split('-')[0]);
    });
    return Array.from(years).sort();
};

export const getAvailableMonths = (data: PowerData, year: string): string[] => {
    const months = new Set<string>();
    Object.keys(data).forEach(date => {
        if (date.startsWith(year)) {
            months.add(date.split('-')[1]);
        }
    });
    return Array.from(months).sort();
};

export const getAvailableDays = (data: PowerData, year: string, month: string): string[] => {
    const days = new Set<string>();
    Object.keys(data).forEach(date => {
        if (date.startsWith(`${year}-${month}`)) {
            days.add(date.split('-')[2]);
        }
    });
    return Array.from(days).sort();
};

export const getAvailableHours = (data: PowerData, date: string): string[] => {
    return data[date] ? Object.keys(data[date]).sort() : [];
};