import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData
} from 'chart.js';
import { database } from '../../config/firebase';
import { ref, get } from 'firebase/database';
import { PowerData, TimeRange, DateSelections } from './types';
import { calculateAverages, getAvailableYears, getAvailableMonths,
    getAvailableDays, getAvailableHours, monthNames } from './utils';
import './ElectricityUsageChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

type ChartDataType = ChartData<'bar', number[], string>;

const ElectricityUsageChart = () => {
    const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
    const [chartData, setChartData] = useState<ChartDataType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDateTime, setCurrentDateTime] = useState<string>('');
    const [rawData, setRawData] = useState<PowerData | null>(null);
    const [dateSelections, setDateSelections] = useState<DateSelections>({
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString().padStart(2, '0') // Add default month
    });
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [availableDays, setAvailableDays] = useState<string[]>([]);
    const [availableHours, setAvailableHours] = useState<string[]>([]);

    const currentUser = "RealChAuLa";

    const formatDateTime = (date: Date): string => {
        const pad = (num: number): string => num.toString().padStart(2, '0');

        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1);
        const day = pad(date.getUTCDate());
        const hours = pad(date.getUTCHours());
        const minutes = pad(date.getUTCMinutes());
        const seconds = pad(date.getUTCSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    useEffect(() => {
        const updateDateTime = () => {
            setCurrentDateTime(formatDateTime(new Date()));
        };

        fetchData();
        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (rawData) {
            updateAvailableOptions();
            processAndUpdateChart();
        }
    }, [rawData, timeRange, dateSelections]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const dataRef = ref(database, 'electricity_usage');
            const snapshot = await get(dataRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                setRawData(data);
                const years = getAvailableYears(data);
                setAvailableYears(years);
                if (years.length > 0) {
                    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
                    setDateSelections(prev => ({
                        ...prev,
                        year: years[years.length - 1],
                        month: currentMonth
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateAvailableOptions = () => {
        if (!rawData || !dateSelections.year) return;

        const months = getAvailableMonths(rawData, dateSelections.year);
        setAvailableMonths(months);

        if (dateSelections.month) {
            const days = getAvailableDays(rawData, dateSelections.year, dateSelections.month);
            setAvailableDays(days);

            if (dateSelections.day) {
                const date = `${dateSelections.year}-${dateSelections.month}-${dateSelections.day}`;
                const hours = getAvailableHours(rawData, date);
                setAvailableHours(hours);
            }
        }
    };

    const processAndUpdateChart = () => {
        if (!rawData) return;

        let processedData;
        switch (timeRange) {
            case 'yearly':
                processedData = calculateAverages.yearly(rawData, dateSelections.year);
                break;
            case 'monthly':
                if (dateSelections.month) {
                    processedData = calculateAverages.monthly(rawData, dateSelections.year, dateSelections.month);
                }
                break;
            case 'daily':
                if (dateSelections.month && dateSelections.day) {
                    const date = `${dateSelections.year}-${dateSelections.month}-${dateSelections.day}`;
                    processedData = calculateAverages.daily(rawData, date);
                }
                break;
            case 'hourly':
                if (dateSelections.month && dateSelections.day && dateSelections.hour) {
                    const date = `${dateSelections.year}-${dateSelections.month}-${dateSelections.day}`;
                    processedData = calculateAverages.hourly(rawData, date, dateSelections.hour);
                }
                break;
        }

        if (processedData) {
            setChartData({
                labels: processedData.labels,
                datasets: [{
                    label: 'Power Usage (W)',
                    data: processedData.values,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            });
        }
    };

    const handleTimeRangeChange = (newRange: TimeRange) => {
        setTimeRange(newRange);
        if (newRange === 'yearly') {
            setDateSelections({ year: dateSelections.year });
        } else {
            // Keep the month selection for non-yearly views
            setDateSelections({
                year: dateSelections.year,
                month: dateSelections.month || (new Date().getMonth() + 1).toString().padStart(2, '0')
            });
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    usePointStyle: true,
                    padding: 20
                }
            },
            title: {
                display: true,
                text: `Power Usage (${timeRange})`,
                font: {
                    family: "'Inter', sans-serif",
                    size: 16,
                    weight: 'bold' as const
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Power (Watts)',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: 'normal' as const
                    }
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: timeRange === 'yearly' ? 'Months' :
                        timeRange === 'monthly' ? 'Days' :
                            timeRange === 'daily' ? 'Hours' : 'Minutes',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: 'normal' as const
                    }
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    }
                }
            }
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-info">
                    <div className="header-title">
                        <h2>Power Consumption Dashboard</h2>
                        <div className="time-user-info">
                            <div className="datetime-display">
                                <span className="info-label">Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):</span>
                                <span className="info-value">{currentDateTime}</span>
                            </div>
                            <div className="user-display">
                                <span className="info-label">Current User's Login:</span>
                                <span className="info-value">{currentUser}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="controls-section">
                    <div className="time-range-control">
                        <label htmlFor="timeRange">View Mode:</label>
                        <select
                            id="timeRange"
                            value={timeRange}
                            onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
                            className="time-range-select"
                        >
                            <option value="yearly">Yearly View</option>
                            <option value="monthly">Monthly View</option>
                            <option value="daily">Daily View</option>
                            <option value="hourly">Hourly View</option>
                        </select>
                    </div>

                    <div className="date-selectors-wrapper">
                        <div className="date-selectors">
                            <div className="select-group">
                                <label htmlFor="yearSelect">Year:</label>
                                <select
                                    id="yearSelect"
                                    value={dateSelections.year}
                                    onChange={(e) => setDateSelections({ year: e.target.value })}
                                    className="date-select"
                                >
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            {timeRange !== 'yearly' && (
                                <div className="select-group">
                                    <label htmlFor="monthSelect">Month:</label>
                                    <select
                                        id="monthSelect"
                                        value={dateSelections.month}
                                        onChange={(e) => setDateSelections({
                                            ...dateSelections,
                                            month: e.target.value,
                                            day: undefined,
                                            hour: undefined
                                        })}
                                        className="date-select"
                                    >
                                        <option value="">Select Month</option>
                                        {availableMonths.map(month => (
                                            <option key={month} value={month}>
                                                {monthNames[parseInt(month) - 1]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {(timeRange === 'daily' || timeRange === 'hourly') && dateSelections.month && (
                                <div className="select-group">
                                    <label htmlFor="daySelect">Day:</label>
                                    <select
                                        id="daySelect"
                                        value={dateSelections.day}
                                        onChange={(e) => setDateSelections({
                                            ...dateSelections,
                                            day: e.target.value,
                                            hour: undefined
                                        })}
                                        className="date-select"
                                    >
                                        <option value="">Select Day</option>
                                        {availableDays.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {timeRange === 'hourly' && dateSelections.day && (
                                <div className="select-group">
                                    <label htmlFor="hourSelect">Hour:</label>
                                    <select
                                        id="hourSelect"
                                        value={dateSelections.hour}
                                        onChange={(e) => setDateSelections({
                                            ...dateSelections,
                                            hour: e.target.value
                                        })}
                                        className="date-select"
                                    >
                                        <option value="">Select Hour</option>
                                        {availableHours.map(hour => (
                                            <option key={hour} value={hour}>{`${hour}:00`}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="chart-section">
                <div className="chart-wrapper">
                    {isLoading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading data...</p>
                        </div>
                    ) : chartData ? (
                        <div className="chart-container">
                            <Bar data={chartData} options={chartOptions} />
                            {chartData.datasets[0].data.length === 0 && (
                                <div className="no-data-overlay">
                                    <span className="no-data-icon">📊</span>
                                    <p>No data available for selected time period</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-data">
                            <span className="no-data-icon">📊</span>
                            <p>Select time range and date to view data</p>
                        </div>
                    )}
                </div>

                <div className="chart-footer">
                    <div className="data-summary">
                        {chartData && (
                            <>
                                <div className="summary-item">
                                    <span className="summary-label">Average:</span>
                                    <span className="summary-value">
                    {(chartData.datasets[0].data.reduce((a, b) => a + b, 0) /
                        chartData.datasets[0].data.filter(v => v > 0).length || 0).toFixed(2)} W
                  </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Max:</span>
                                    <span className="summary-value">
                    {Math.max(...chartData.datasets[0].data).toFixed(2)} W
                  </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Data Points:</span>
                                    <span className="summary-value">
                    {chartData.datasets[0].data.filter(v => v > 0).length}
                  </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElectricityUsageChart;