import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';

interface Feature {
  title: string;
  description: string;
  iconClass?: string;
}

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  standalone: true,
  imports: [NgFor, NgClass],  // Add this imports array
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      title: 'Real-Time Monitoring',
      description: 'Track your electricity consumption in real-time with detailed analytics and insights.',
      iconClass: 'monitor-icon'
    },
    {
      title: 'Easy Bill Payment',
      description: 'Pay your electricity bills directly through the app with secure payment options.',
      iconClass: 'payment-icon'
    },
    {
      title: 'Smart Alerts',
      description: 'Receive notifications about usage patterns and potential savings opportunities.',
      iconClass: 'alert-icon'
    }
  ];
}
