export interface PowerData {
    [date: string]: {
        [hour: string]: {
            [minute: string]: number;
        };
    };
}

export interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    tension: number;
    fill: boolean;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export type TimeRange = 'yearly' | 'monthly' | 'daily' | 'hourly' | 'minutely';

export interface DataPoint {
    label: string;
    value: number;
}

export interface DateSelections {
    year: string;
    month?: string;
    day?: string;
    hour?: string;
}

export interface ChartDataPoint {
    label: string;
    value: number;
}

export interface ProcessedData {
    labels: string[];
    values: number[];
}