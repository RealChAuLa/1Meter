import {Component, OnInit} from '@angular/core';
// @ts-ignore
import { MatDialog } from '@angular/material/dialog';
import {LoginDialogComponent} from '../login-overlay/login-overlay.component';
import {ActivatedRoute, Router} from '@angular/router';
import {NgIf} from '@angular/common';
import {AuthStore} from '../../services/auth-store';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [
    NgIf
  ],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: string | null = 'Not Logged In';
  isAuthenticated: boolean = false;
  productId: string | null = '';
  currentDateTime: string = '2025-03-06 02:14:45';
  username: string | null = '';
  private checkInterval: any;

  constructor(
    private dialog: MatDialog,
    protected router: Router
  ) {}

  ngOnInit(): void {
    // Initial fetch of values
    this.updateAuthStatus();

    // Set up interval to check for auth changes
    this.checkInterval = setInterval(() => {
      const prevUsername = this.username;
      const prevProductId = this.productId;
      const prevAuth = this.isAuthenticated;

      this.updateAuthStatus();

      // Log changes for debugging (optional)
      if (prevUsername !== this.username ||
        prevProductId !== this.productId ||
        prevAuth !== this.isAuthenticated) {
        console.log('Auth state changed, navbar updated');
      }
    }, 1000); // Check every 1 second
  }
  private updateAuthStatus(): void {
    this.username = AuthStore.username;
    this.productId = AuthStore.productId;
    this.isAuthenticated = AuthStore.isAuthenticated;
    this.currentUser = this.isAuthenticated ? this.username : 'Not Logged In';
  }

  ngOnDestroy(): void {
    // Clean up the interval when component is destroyed
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  login() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '450px',
      panelClass: 'custom-dialog-container',
      data: { mode: 'login' }
    });
  }

  signup() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      data: { mode: 'signup' }
    });
  }

  logout() {
    console.log('Logging out user...');
    AuthStore.clearAuthInfo();
    this.username = null;
    this.productId = null;
    this.isAuthenticated = false;
    this.currentUser = 'Not Logged In';
    this.router.navigate(['/']);
  }

  navigateToUsage() {
    this.router.navigate(['/electricity-usage']);
  }

  navigateToBill() {
    this.router.navigate(['/bill']);
  }
}
