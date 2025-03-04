import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  // You can add login/signup methods here
  login() {
    console.log('Login clicked');
  }

  signup() {
    console.log('Signup clicked');
  }
}
