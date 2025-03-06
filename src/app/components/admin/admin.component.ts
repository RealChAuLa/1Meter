import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of, Subscription, interval } from 'rxjs';
import {NgClass, NgIf} from '@angular/common';

interface User {
  username: string;
  product_id: string;
  email: string;
  connection_status: boolean;
  last_active: string | null;
}

interface ConnectionStatusResponse {
  timestamp: string;
  users: User[];
  total_count: number;
}

interface ConnectionStatusRequest {
  product_id: string;
  status: boolean;
}

@Component({
  selector: 'app-connection-status-admin',
  templateUrl: './admin.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  users: User[] = [];
  timestamp: string = '';
  totalCount: number = 0;
  activeCount: number = 0;
  inactiveCount: number = 0;
  loading: boolean = true;
  error: string | null = null;
  isToggling: { [key: string]: boolean } = {};
  refreshInterval: Subscription | null = null;

  // Current user info
  currentUser: string = 'RealChAuLa';
  currentDateTime: string = '2025-03-06 07:27:32';

  private apiBaseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadConnectionStatus();

    // Auto-refresh every 30 seconds
    this.refreshInterval = interval(30000).subscribe(() => {
      this.loadConnectionStatus(false); // silent refresh
    });
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }

  loadConnectionStatus(showLoading: boolean = true): void {
    if (showLoading) {
      this.loading = true;
    }
    this.error = null;

    this.http.get<ConnectionStatusResponse>(`${this.apiBaseUrl}/electricity/connection-status`)
      .pipe(
        catchError(error => {
          this.error = 'Failed to load connection status data. Please try again.';
          console.error('Error fetching connection status:', error);
          return of(null);
        }),
        finalize(() => {
          if (showLoading) {
            this.loading = false;
          }
        })
      )
      .subscribe(response => {
        if (response) {
          this.users = response.users;
          this.timestamp = response.timestamp;
          this.totalCount = response.total_count;

          // Calculate active and inactive counts
          this.activeCount = this.users.filter(user => user.connection_status).length;
          this.inactiveCount = this.totalCount - this.activeCount;

          // Log activity
          console.log(`Connection status data updated at ${new Date().toISOString()} by ${this.currentUser}`);
        }
      });
  }

  toggleConnectionStatus(productId: string, newStatus: boolean): void {
    // Set loading state for this specific toggle
    this.isToggling = { ...this.isToggling, [productId]: true };

    const requestBody: ConnectionStatusRequest = {
      product_id: productId,
      status: newStatus
    };

    this.http.post<any>(`${this.apiBaseUrl}/electricity/connection-status`, requestBody)
      .pipe(
        catchError(error => {
          alert(`Failed to update connection status for product ID: ${productId}`);
          console.error('Error updating connection status:', error);
          return of(null);
        }),
        finalize(() => {
          // Clear loading state for this toggle
          const updatedToggles = { ...this.isToggling };
          delete updatedToggles[productId];
          this.isToggling = updatedToggles;
        })
      )
      .subscribe(response => {
        if (response) {
          // Update the user in the local array
          const userIndex = this.users.findIndex(user => user.product_id === productId);
          if (userIndex !== -1) {
            this.users[userIndex].connection_status = newStatus;

            // Update counts
            this.activeCount = this.users.filter(user => user.connection_status).length;
            this.inactiveCount = this.totalCount - this.activeCount;

            // Log the change
            console.log(`Connection status for product ${productId} set to ${newStatus ? 'online' : 'offline'} by ${this.currentUser} at ${this.currentDateTime}`);
          }
        } else {
          // Revert the UI state if the API call failed
          this.loadConnectionStatus();
        }
      });
  }

  // Helper function to format dates consistently
  formatDate(dateString: string | null): string {
    if (!dateString) return 'Never';

    try {
      // Assuming dateString is already in correct format
      return dateString;
    } catch (err) {
      return 'Invalid date';
    }
  }
}
