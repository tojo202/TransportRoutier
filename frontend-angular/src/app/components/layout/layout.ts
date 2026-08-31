// src/app/components/layout/layout.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent implements OnInit {
  username: string = '';
  role: string = '';
  breadcrumbs: Breadcrumb[] = [];

  constructor(public authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.breadcrumbs = this.createBreadcrumbs(this.router.url);
    });
  }

  ngOnInit(): void {
    // Initial breadcrumb setup
    this.breadcrumbs = this.createBreadcrumbs(this.router.url);

    // L'Observable `currentUser$` fournit les données du user connecté.
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.username = user.name ?? user.email ?? '';
        this.role = user.role ?? '';
      }
    });
  }

  createBreadcrumbs(routeUrl: string): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];
    const parts = routeUrl.split('?')[0].split('/').filter(p => p);
    
    let currentUrl = '';
    
    // Add Home breadcrumb
    breadcrumbs.push({ label: 'Accueil', url: '/dashboard' });

    for (let i = 0; i < parts.length; i++) {
      currentUrl += `/${parts[i]}`;
      // Basic formatting for label (capitalize first letter, replace dashes with spaces)
      let label = parts[i].charAt(0).toUpperCase() + parts[i].slice(1).replace(/-/g, ' ');
      
      // Optional mapping for specific routes
      const labelMapping: {[key: string]: string} = {
        'dashboard': 'Tableau de bord',
        'agencies': 'Agences',
        'vehicles': 'Véhicules',
        'drivers': 'Chauffeurs',
        'routes': 'Lignes & Trajets',
        'schedules': 'Horaires',
        'reservations': 'Réservations',
        'tickets': 'Billetterie',
        'payments': 'Paiements',
        'baggages': 'Bagages',
        'gps': 'Suivi GPS',
        'reports': 'Rapports & Stats'
      };

      if (labelMapping[parts[i]]) {
        label = labelMapping[parts[i]];
      }

      // Avoid duplicating home if we are on dashboard
      if (parts[i] !== 'dashboard') {
        breadcrumbs.push({
          label: label,
          url: currentUrl
        });
      }
    }
    
    return breadcrumbs;
  }

  // -----------------------------------------------------------------------
  // Notifications
  // -----------------------------------------------------------------------
  showNotifications = false;
  notifications: { id: number; icon: string; iconColor: string; message: string; time: string; read: boolean }[] = [
    { id: 1, icon: 'confirmation_number', iconColor: 'primary', message: 'Nouvelle réservation reçue', time: 'Il y a 5 min', read: false },
    { id: 2, icon: 'payments', iconColor: 'success', message: 'Paiement de 45 000 Ar confirmé', time: 'Il y a 22 min', read: false },
    { id: 3, icon: 'directions_bus', iconColor: 'warning', message: 'Véhicule IMM-1234 en maintenance', time: 'Il y a 1h', read: true },
    { id: 4, icon: 'badge', iconColor: 'info', message: 'Nouveau chauffeur enregistré', time: 'Hier', read: true },
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAllRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
  }

  markRead(id: number): void {
    const n = this.notifications.find(n => n.id === id);
    if (n) n.read = true;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  // -----------------------------------------------------------------------
  // Logout — fire and forget
  // Nettoyer immédiatement le token local et rediriger.
  // L'appel au serveur part en arrière-plan (invalidation du token côté API).
  // -----------------------------------------------------------------------
  logout(): void {
    // 1. Suppression locale immédiate
    this.authService.removeToken();
    // 2. Redirection immédiate
    this.router.navigate(['/login']);
    // 3. Signal serveur en arrière-plan (best-effort)
    this.authService.logout().subscribe({ error: () => { /* ignoré */ } });
  }
}
