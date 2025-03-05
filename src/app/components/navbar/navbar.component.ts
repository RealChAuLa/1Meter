import { Component } from '@angular/core';
// @ts-ignore
import { MatDialog } from '@angular/material/dialog';
import {LoginDialogComponent} from '../login-overlay/login-overlay.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  currentUser: string | null = null;

  constructor(private dialog: MatDialog) {
    // You might get this from an auth service in a real app
    this.currentUser = null;
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
    this.currentUser = null;
    // You would normally call your auth service logout method
    console.log('User logged out');
  }
}
