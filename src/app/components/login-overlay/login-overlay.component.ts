import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthStore } from '../../services/auth-store';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-overlay.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['./login-overlay.component.css']
})
export class LoginDialogComponent implements OnInit {
  loginForm!: FormGroup;
  signupForm!: FormGroup;
  isLoginMode = true;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient, // Inject HttpClient here
    private router: Router, // Inject Router here
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.isLoginMode = this.data?.mode === 'signup' ? false : true;

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      product_id: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  onSubmit(): void {
    this.isLoading = true;

    if (this.isLoginMode) {
      if (this.loginForm.valid) {
        console.log('Login form submitted', this.loginForm.value);
        this.isLoading = true;

        // Call the user login API directly
        this.http.post('http://localhost:8000/auth/signin', this.loginForm.value).subscribe(
          (response: any) => {
            console.log('Login successful', response);
            this.isLoading = false;

            // Save the username and product_id in local variables
            const username = response.username;
            const productId = response.product_id;

            // Store auth info in our shared store instead of localStorage
            AuthStore.setAuthInfo(response.username, response.product_id);


            this.dialogRef.close();
            // Redirect to /electricity-usage page and pass the variables
            this.router.navigate(['/electricity-usage'], { state: { username, productId } });

          },
          (error: any) => {
            console.error('Login failed', error);
            this.isLoading = false;
          }
        );
      }
    } else {
      if (this.signupForm.valid) {
        console.log('Signup form submitted', this.signupForm.value);
        this.isLoading = true;

        this.http.post('http://localhost:8000/auth/signup', this.signupForm.value).subscribe(
          (response: any) => { // Explicitly type response
            console.log('Registration successful', response);
            this.isLoading = false;
            this.isLoginMode = true;
          },
          (error: any) => { // Explicitly type error
            console.error('Registration failed', error);
            this.isLoading = false;
          }
        );
      }
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getEmailErrorMessage(): string {
    const emailCtrl = this.isLoginMode ? this.signupForm.get('email') : null;

    if (emailCtrl?.hasError('required')) {
      return 'Email is required';
    }
    return emailCtrl?.hasError('email') ? 'Not a valid email' : '';
  }

  getPasswordErrorMessage(): string {
    const passwordCtrl = this.isLoginMode ?
      this.loginForm.get('password') :
      this.signupForm.get('password');

    if (passwordCtrl?.hasError('required')) {
      return 'Password is required';
    }
    return passwordCtrl?.hasError('minlength') ? 'Password must be at least 8 characters' : '';
  }
}
