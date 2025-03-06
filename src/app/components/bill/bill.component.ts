import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {NavbarComponent} from '../navbar/navbar.component';
import {AuthStore} from '../../services/auth-store';

interface BillData {
  username: string;
  year_month: string;
  total_kwh: number;
  amount: number;
  is_paid: boolean;
  payment_date: string | null;
  message: string;
}

interface PaymentHistory {
  username: string;
  payments: {
    month: string;
    amount: number;
  }[];
  email: string;
}

interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
}

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent]
})
export class BillComponent implements OnInit {
  currentDateTime: string = '2025-03-06 05:57:00';
  username = AuthStore.username;
  productId = AuthStore.productId;
  isLoading: boolean = true;
  isLoadingHistory: boolean = true;
  isSubmitting: boolean = false;
  currentBill: BillData | null = null;
  paymentHistory: PaymentHistory | null = null;

  paymentDetails: PaymentDetails = {
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // Get product ID if available from route
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('productId') || '';
    });

    // Load bill and payment history
    this.loadCurrentBill();
    this.loadPaymentHistory();
  }

  loadCurrentBill(): void {
    this.isLoading = true;

    // Use the API endpoint for current bill
    this.http.get<BillData>(`http://localhost:8000/electricity/bill/${this.username}`)
      .subscribe({
        next: (data) => {
          this.currentBill = data;
          this.isLoading = false;
          console.log('Current bill data:', data);
        },
        error: (error) => {
          console.error('Error fetching bill data:', error);
          this.isLoading = false;

          // Fallback data for demonstration if the API fails
          this.currentBill = {
            username: 'RealChAuLa',
            year_month: '2025-02',
            total_kwh: 142.5,
            amount: 4170.0,
            is_paid: false,
            payment_date: null,
            message: 'Unpaid bill for 2025-02. Please make a payment.'
          };
        }
      });
  }

  loadPaymentHistory(): void {
    this.isLoadingHistory = true;

    // Use the API endpoint for payment history
    this.http.get<PaymentHistory>(`http://localhost:8000/electricity/payments/${this.username}`)
      .subscribe({
        next: (data) => {
          this.paymentHistory = data;
          this.isLoadingHistory = false;
          console.log('Payment history:', data);
        },
        error: (error) => {
          console.error('Error fetching payment history:', error);
          this.isLoadingHistory = false;

          // Fallback data for demonstration if the API fails
          this.paymentHistory = {
            username: 'RealChAuLa',
            payments: [
              {
                month: '2025-01',
                amount: 2114.84
              }
            ],
            email: 'RealChAuLa@example.com'
          };
        }
      });
  }

  makePayment(): void {
    // Validate payment details
    if (!this.validatePaymentForm()) {
      alert('Please fill in all payment details correctly.');
      return;
    }

    this.isSubmitting = true;

    // Simulate API call for payment
    setTimeout(() => {
      console.log('Payment submitted:', {
        username: this.username,
        amount: this.currentBill?.amount,
        paymentDetails: this.paymentDetails
      });

      // Update current bill state after payment
      if (this.currentBill) {
        this.currentBill = {
          ...this.currentBill,
          is_paid: true,
          payment_date: this.currentDateTime,
          message: `Bill for ${this.currentBill.year_month} has been successfully paid.`
        };
      }

      // Update payment history
      if (this.paymentHistory && this.currentBill) {
        this.paymentHistory.payments = [
          {
            month: this.currentBill.year_month,
            amount: this.currentBill.amount
          },
          ...this.paymentHistory.payments
        ];
      }

      // Reset form
      this.paymentDetails = {
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: ''
      };

      this.isSubmitting = false;
    }, 2000);
  }

  validatePaymentForm(): boolean {
    // Basic validation
    if (!this.paymentDetails.cardNumber || this.paymentDetails.cardNumber.length < 16) {
      return false;
    }

    if (!this.paymentDetails.expiry || !this.paymentDetails.expiry.includes('/')) {
      return false;
    }

    if (!this.paymentDetails.cvv || this.paymentDetails.cvv.length < 3) {
      return false;
    }

    if (!this.paymentDetails.name || this.paymentDetails.name.length < 3) {
      return false;
    }

    return true;
  }

  // Format card number with spaces for better readability
  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 16) {
      value = value.substr(0, 16);
    }

    // Add spaces after every 4 digits
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }

    this.paymentDetails.cardNumber = formattedValue;
  }

  // Format expiry date as MM/YY
  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substr(0, 4);
    }

    if (value.length > 2) {
      value = value.substr(0, 2) + '/' + value.substr(2);
    }

    this.paymentDetails.expiry = value;
  }

  // Limit CVV to 3-4 digits
  formatCVV(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substr(0, 4);
    }

    this.paymentDetails.cvv = value;
  }
}
