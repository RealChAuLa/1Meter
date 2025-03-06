// app.routes.ts
import { Routes } from '@angular/router';
import { ElectricityUsageComponent } from './components/electricity-usage/electricity-usage.component';
import {HomeComponent} from './components/home/home.component';
import {BillComponent} from './components/bill/bill.component';
import {AdminComponent} from './components/admin/admin.component';

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
    path: 'bill',
    component: BillComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
  },
  {
    path: '**',
    redirectTo: ''
  }
];
