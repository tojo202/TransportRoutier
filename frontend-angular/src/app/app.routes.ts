import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './components/layout/layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'agencies',
        loadComponent: () => import('./pages/agencies/agencies').then(m => m.AgenciesComponent)
      },
      {
        path: 'vehicles',
        loadComponent: () => import('./pages/vehicles/vehicles').then(m => m.VehiclesComponent)
      },
      {
        path: 'drivers',
        loadComponent: () => import('./pages/drivers/drivers').then(m => m.DriversComponent)
      },
      {
        path: 'routes',
        loadComponent: () => import('./pages/routes/routes').then(m => m.RoutesComponent)
      },
      {
        path: 'reservations',
        loadComponent: () => import('./pages/reservations/reservations').then(m => m.ReservationsComponent)
      },
      {
        path: 'tickets',
        loadComponent: () => import('./pages/tickets/tickets').then(m => m.TicketsComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/payments/payments').then(m => m.PaymentsComponent)
      },
      {
        path: 'baggages',
        loadComponent: () => import('./pages/baggages/baggages').then(m => m.BaggagesComponent)
      },
      {
        path: 'gps',
        loadComponent: () => import('./pages/gps/gps').then(m => m.GPSComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports').then(m => m.ReportsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile)
      },
      {
        path: 'schedules',
        loadComponent: () => import('./pages/schedules/schedules').then(m => m.SchedulesComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
