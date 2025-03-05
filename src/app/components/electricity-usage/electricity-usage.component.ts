import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

// Register Chart.js components
Chart.register(...registerables);

interface DataPoint {
  label: string;
  value: number;
}

interface ChartData {
  data_points: DataPoint[];
  chart_title: string;
  x_axis_label: string;
  y_axis_label: string;
}

@Component({
  selector: 'app-electricity-usage',
  templateUrl: './electricity-usage.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./electricity-usage.component.css']
})
export class ElectricityUsageComponent implements OnInit, AfterViewInit {
  @ViewChild('usageChart') usageChartRef!: ElementRef<HTMLCanvasElement>;

  username: string;
  productId!: string;

  // Chart-related properties
  chart: Chart | null = null;
  chartData: ChartData | null = null;

  // UI state
  selectedMode: 'hourly' | 'daily' | 'monthly' | 'yearly' = 'hourly';
  selectedDate: string;
  selectedYear: string;
  selectedMonth: string;
  selectedHour: string = '00';
  isLoading = false;
  hasAttemptedFetch = false;

  // Options for selectors
  availableYears: string[] = [];

  private baseUrl = 'http://localhost:8000/electricity';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    // Get data from router state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { username: string; productId: string };

    // If state exists, use it; otherwise provide default or fallback values
    if (state) {
      this.username = state.username;
      this.productId = state.productId;
    } else {
      // Try to get from route params or queryParams as fallback
      this.route.paramMap.subscribe(params => {
        this.productId = params.get('productId') || 'unknown';
      });
      this.username = 'RealChAuLa'; // Default to the current user
    }

    // Set up initial date values based on current date
    const today = new Date();
    this.selectedDate = this.formatDate(today);
    this.selectedYear = today.getFullYear().toString();
    this.selectedMonth = this.padNumber(today.getMonth() + 1);

    // Generate available years (current year and 5 previous years)
    const currentYear = today.getFullYear();
    for (let i = 0; i < 6; i++) {
      this.availableYears.push((currentYear - i).toString());
    }
  }

  ngOnInit(): void {
    // Initial setup - no data fetch until user requests it
  }

  ngAfterViewInit(): void {
    // Canvas is ready but we don't create the chart yet
    // Chart will be created when data is fetched
  }

  setMode(mode: 'hourly' | 'daily' | 'monthly' | 'yearly'): void {
    this.selectedMode = mode;

    // Reset chart data when mode changes
    this.chartData = null;
    this.hasAttemptedFetch = false;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  fetchUsageData(): void {
    this.isLoading = true;
    this.hasAttemptedFetch = true;

    // Reset chart data before fetching new data
    this.chartData = null;

    let endpoint = '';

    switch (this.selectedMode) {
      case 'hourly':
        // Get minute-by-minute data for a specific hour
        const dateHourParams = `${this.productId}/${this.selectedDate}/${this.selectedHour}`;
        endpoint = `${this.baseUrl}/minutely/${dateHourParams}`;
        break;

      case 'daily':
        // Get hourly data for a specific day
        endpoint = `${this.baseUrl}/hourly/${this.productId}/${this.selectedDate}`;
        break;

      case 'monthly':
        // Get daily data for a specific month
        const yearMonth = `${this.selectedYear}-${this.selectedMonth}`;
        endpoint = `${this.baseUrl}/daily/${this.productId}/${yearMonth}`;
        break;

      case 'yearly':
        // Get monthly data for a specific year
        endpoint = `${this.baseUrl}/monthly/${this.productId}/${this.selectedYear}`;
        break;
    }

    console.log('Fetching data from:', endpoint);

    this.http.get<ChartData>(endpoint)
      .pipe(
        catchError(error => {
          console.error('Error fetching usage data:', error);
          this.chartData = null;
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(data => {
        if (data && data.data_points && data.data_points.length > 0) {
          console.log('Received data:', data);
          this.chartData = data;

          // Force change detection to update the DOM
          this.changeDetectorRef.detectChanges();

          // Delay chart rendering slightly to ensure DOM is updated
          setTimeout(() => {
            this.renderChart();
          }, 0);
        } else {
          console.warn('No data points received or empty data array');
          this.chartData = null;
        }
      });
  }

  renderChart(): void {
    if (!this.chartData || !this.chartData.data_points || this.chartData.data_points.length === 0) {
      console.warn('No chart data available for rendering');
      return;
    }

    // Make sure the canvas element is available
    if (!this.usageChartRef || !this.usageChartRef.nativeElement) {
      console.error('Chart canvas element is not available');
      return;
    }

    const ctx = this.usageChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context from canvas');
      return;
    }

    // Destroy previous chart if it exists
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const labels = this.chartData.data_points.map(point => point.label);
    const data = this.chartData.data_points.map(point => point.value);

    console.log('Rendering chart with labels:', labels);
    console.log('Rendering chart with data:', data);

    try {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Power Consumption (W)',
            data: data,
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderColor: '#3498db',
            borderWidth: 2,
            pointBackgroundColor: '#3498db',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#2c3e50',
            pointHoverBorderColor: '#ffffff',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              titleColor: '#2c3e50',
              bodyColor: '#2c3e50',
              borderColor: '#e0e0e0',
              borderWidth: 1,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `${context.parsed.y.toFixed(2)} W`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                tickLength: 8
              },
              title: {
                display: true,
                text: this.chartData.x_axis_label,
                color: '#7f8c8d',
                font: {
                  size: 12
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              title: {
                display: true,
                text: this.chartData.y_axis_label,
                color: '#7f8c8d',
                font: {
                  size: 12
                }
              },
              ticks: {
                callback: function(value) {
                  return value + ' W';
                }
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'nearest'
          },
          hover: {
            mode: 'nearest',
            intersect: false
          },
          elements: {
            line: {
              tension: 0.3
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  downloadChart(): void {
    if (!this.chart) return;

    const canvas = this.usageChartRef.nativeElement;
    const imageURL = canvas.toDataURL('image/png');

    // Create download link
    const a = document.createElement('a');
    a.href = imageURL;
    a.download = `electricity-usage-${this.selectedMode}-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  refreshData(): void {
    this.fetchUsageData();
  }

  calculateAverage(): number {
    if (!this.chartData || this.chartData.data_points.length === 0) return 0;

    const sum = this.chartData.data_points.reduce((acc, point) => acc + point.value, 0);
    return sum / this.chartData.data_points.length;
  }

  getPeakUsage(): number {
    if (!this.chartData || this.chartData.data_points.length === 0) return 0;

    return Math.max(...this.chartData.data_points.map(point => point.value));
  }

  getLowestUsage(): number {
    if (!this.chartData || this.chartData.data_points.length === 0) return 0;

    return Math.min(...this.chartData.data_points.map(point => point.value));
  }

  // Helper function to format date as YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = this.padNumber(date.getMonth() + 1);
    const day = this.padNumber(date.getDate());

    return `${year}-${month}-${day}`;
  }

  // Helper function to pad single digit numbers with leading zero
  private padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
