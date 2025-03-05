// app.routes.ts
import { Routes } from '@angular/router';
import { ElectricityUsageComponent } from './components/electricity-usage/electricity-usage.component';
import {HomeComponent} from './components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  },
  {
    path: 'electricity-usage',
    component: ElectricityUsageComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
