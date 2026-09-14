import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './components/layout/layout';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'platform',
        loadComponent: () => import('./pages/platform/platform').then(m => m.PlatformComponent)
      },
      {
        path: 'my-reservations',
        loadComponent: () => import('./pages/my-reservations/my-reservations').then(m => m.MyReservationsComponent)
      },
      {
        path: 'driver-trips',
        loadComponent: () => import('./pages/driver-trips/driver-trips').then(m => m.DriverTripsComponent)
      },
      {
        path: 'driver-scan',
        loadComponent: () => import('./pages/driver-scan/driver-scan').then(m => m.DriverScanComponent)
      },
      {
        path: 'publish-trip',
        loadComponent: () => import('./pages/publish-trip/publish-trip').then(m => m.PublishTripComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('./pages/chat/chat').then(m => m.ChatComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./pages/reviews/reviews').then(m => m.ReviewsComponent)
      },
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
        path: 'schedules',
        loadComponent: () => import('./pages/schedules/schedules').then(m => m.SchedulesComponent)
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
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports').then(m => m.ReportsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile)
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/home' }
];
