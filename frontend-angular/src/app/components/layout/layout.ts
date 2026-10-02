import { ChangeDetectionStrategy, Component, HostListener, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../shared/services/toast.service';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { CommandPaletteComponent } from '../../shared/components/command-palette/command-palette.component';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

export interface Breadcrumb {
  label: string;
  url: string;
}

export interface NavSection {
  id: string;
  title: string;
  icon: string;
  items: NavItem[];
  roles: string[];
}

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  isNew?: boolean;
  notificationCount?: number;
  roles?: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    RouterOutlet, 
    ToastContainerComponent,
    CommandPaletteComponent,
    RevealOnScrollDirective
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent implements OnInit {
  protected authService = inject(AuthService);
  protected router = inject(Router);
  protected toastService = inject(ToastService);

  username: string = '';
  role: string = '';
  breadcrumbs: Breadcrumb[] = [];
  
  // Sidebar state
  sidebarCollapsed = signal(false);
  sidebarOpen = signal(false);
  
  // Notifications
  showNotifications = false;
  notifications: { id: number; icon: string; iconColor: string; message: string; time: string; read: boolean }[] = [
    { id: 1, icon: 'confirmation_number', iconColor: 'primary', message: 'Nouvelle réservation reçue', time: 'Il y a 5 min', read: false },
    { id: 2, icon: 'payments', iconColor: 'success', message: 'Paiement de 45 000 Ar confirmé', time: 'Il y a 22 min', read: false },
    { id: 3, icon: 'directions_bus', iconColor: 'warning', message: 'Véhicule IMM-1234 en maintenance', time: 'Il y a 1h', read: true },
    { id: 4, icon: 'badge', iconColor: 'info', message: 'Nouveau chauffeur enregistré', time: 'Hier', read: true },
  ];

  // Quick Actions
  showQuickActions = false;

  // Computed
  unreadCount = computed(() => this.notifications.filter(n => !n.read).length);
  
  navSections = computed<NavSection[]>(() => {
    const role = this.authService.getRole();
    const isAdmin = role === 'admin';
    const isAgent = role === 'agent';
    const isDriver = role === 'driver';
    const isClient = role === 'client';
    const isLoggedIn = this.authService.currentUserSync() !== null;

    const sections: NavSection[] = [];

    // ADMIN SECTIONS
    if (isAdmin) {
      sections.push(
        {
          id: 'main',
          title: 'Vue Principale',
          icon: 'dashboard',
          roles: ['admin'],
          items: [
            { label: 'Tableau de bord', route: '/dashboard', icon: 'dashboard', badge: 'Nouveau', badgeColor: 'success' },
            { label: 'Portail Voyageurs', route: '/platform', icon: 'public' },
          ],
        },
        {
          id: 'fleet',
          title: 'Flotte & Réseau',
          icon: 'directions_bus',
          roles: ['admin'],
          items: [
            { label: 'Agences', route: '/agencies', icon: 'apartment', notificationCount: 1 },
            { label: 'Véhicules', route: '/vehicles', icon: 'directions_bus', badge: '2', badgeColor: 'warning' },
            { label: 'Chauffeurs', route: '/drivers', icon: 'badge', isNew: true },
            { label: 'Lignes & Trajets', route: '/routes', icon: 'alt_route' },
            { label: 'Horaires & Départs', route: '/schedules', icon: 'schedule', notificationCount: 2 },
          ],
        },
        {
          id: 'sales',
          title: 'Vente & Finances',
          icon: 'point_of_sale',
          roles: ['admin'],
          items: [
            { label: 'Réservations', route: '/reservations', icon: 'confirmation_number', notificationCount: 5 },
            { label: 'Billetterie', route: '/tickets', icon: 'receipt_long' },
            { label: 'Paiements', route: '/payments', icon: 'payments', badge: '12', badgeColor: 'success' },
            { label: 'Bagages', route: '/baggages', icon: 'luggage' },
            { label: 'Rapports & Stats', route: '/reports', icon: 'analytics' },
            { label: 'Avis & Évaluations', route: '/reviews', icon: 'star', isNew: true },
            { label: 'Chat Trajets', route: '/chat', icon: 'chat' },
          ],
        }
      );
    }

    // AGENT SECTIONS
    if (isAgent) {
      sections.push({
        id: 'operations',
        title: 'Opérations Commerciales',
        icon: 'storefront',
        roles: ['agent'],
        items: [
          { label: 'Réservations Guichet', route: '/reservations', icon: 'confirmation_number', notificationCount: 3 },
          { label: 'Billetterie', route: '/tickets', icon: 'receipt_long' },
          { label: 'Validation QR Code', route: '/driver-scan', icon: 'qr_code_scanner', badge: 'Nouveau', badgeColor: 'primary' },
          { label: 'Enregistrement Bagages', route: '/baggages', icon: 'luggage' },
          { label: 'Encaissements', route: '/payments', icon: 'payments', notificationCount: 2 },
          { label: 'Plannings Départs', route: '/schedules', icon: 'schedule' },
          { label: 'Plateforme Trajets', route: '/platform', icon: 'public' },
        ],
      });
    }

    // DRIVER SECTIONS
    if (isDriver) {
      sections.push({
        id: 'driver',
        title: 'Espace Chauffeur',
        icon: 'directions_bus',
        roles: ['driver'],
        items: [
          { label: 'Mes Trajets & Missions', route: '/driver-trips', icon: 'directions_bus', notificationCount: 2 },
          { label: 'Scanner Billets (QR)', route: '/driver-scan', icon: 'qr_code_scanner', badge: 'Actif', badgeColor: 'success' },
          { label: 'Publier un départ', route: '/publish-trip', icon: 'add_circle', isNew: true },
          { label: 'Chat Passagers', route: '/chat', icon: 'chat', notificationCount: 1 },
          { label: 'Mes Évaluations', route: '/reviews', icon: 'star', badge: '4.8', badgeColor: 'warning' },
        ],
      });
    }

    // CLIENT SECTIONS
    if (isClient) {
      sections.push({
        id: 'passenger',
        title: 'Espace Voyageur',
        icon: 'flight_takeoff',
        roles: ['client'],
        items: [
          { label: 'Rechercher un Trajet', route: '/platform', icon: 'search' },
          { label: 'Mes Réservations & QR', route: '/my-reservations', icon: 'receipt_long', notificationCount: 1 },
          { label: 'Chat Conducteur', route: '/chat', icon: 'chat' },
          { label: 'Évaluer un voyage', route: '/reviews', icon: 'star', isNew: true },
        ],
      });
    }

    // PUBLIC SECTION (not logged in)
    if (!isLoggedIn) {
      sections.push({
        id: 'public',
        title: 'Navigation',
        icon: 'explore',
        roles: ['public'],
        items: [
          { label: 'Plateforme Trajets', route: '/platform', icon: 'explore' },
          { label: 'Connexion / Inscription', route: '/login', icon: 'login' },
        ],
      });
    }

    return sections;
  });

  // Breadcrumbs for current page
  currentSection = computed(() => {
    const url = this.router.url;
    for (const section of this.navSections()) {
      for (const item of section.items) {
        if (url.startsWith(item.route)) {
          return { section: section.title, item: item.label, icon: item.icon };
        }
      }
    }
    return null;
  });

  constructor() {
    effect(() => {
      const user = this.authService.currentUserSync();
      if (user) {
        this.username = (user as any).name ?? (user as any).email ?? '';
        this.role = user.role ?? '';
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.breadcrumbs = this.createBreadcrumbs(this.router.url);
      this.sidebarOpen.set(false);
    });
  }

  ngOnInit(): void {
    this.breadcrumbs = this.createBreadcrumbs(this.router.url);
    
    // Load sidebar state from localStorage
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      this.sidebarCollapsed.set(savedCollapsed === 'true');
    }
  }

  // Sidebar methods
  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
    localStorage.setItem('sidebarCollapsed', String(this.sidebarCollapsed()));
  }

  toggleMobileSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebarMobile(): void {
    this.sidebarOpen.set(false);
  }

  // Notification methods
  get unreadCountValue(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showQuickActions = false;
  }

  markAllRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.toastService.success('Notifications', 'Toutes les notifications ont été marquées comme lues');
  }

  markRead(id: number): void {
    const n = this.notifications.find(n => n.id === id);
    if (n) n.read = true;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  // Quick Actions
  toggleQuickActions(): void {
    this.showQuickActions = !this.showQuickActions;
    this.showNotifications = false;
  }

  executeQuickAction(action: string): void {
    const actions: Record<string, () => void> = {
      'new-reservation': () => this.router.navigateByUrl('/platform'),
      'new-schedule': () => this.router.navigateByUrl('/publish-trip'),
      'new-vehicle': () => this.router.navigateByUrl('/vehicles'),
      'new-driver': () => this.router.navigateByUrl('/drivers'),
      'reports': () => this.router.navigateByUrl('/reports'),
      'scan': () => this.router.navigateByUrl('/driver-scan'),
    };
    actions[action]?.();
    this.showQuickActions = false;
  }

  // Logout
  logout(): void {
    this.authService.removeToken();
    this.router.navigate(['/login']);
    this.authService.logout().subscribe({ error: () => {} });
  }

  // Breadcrumbs
  createBreadcrumbs(routeUrl: string): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];
    const parts = routeUrl.split('?')[0].split('/').filter(p => p);
    let currentUrl = '';
    breadcrumbs.push({ label: 'Accueil', url: '/dashboard' });

    for (let i = 0; i < parts.length; i++) {
      currentUrl += `/${parts[i]}`;
      let label = parts[i].charAt(0).toUpperCase() + parts[i].slice(1).replace(/-/g, ' ');
      const labelMapping: { [key: string]: string } = {
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
        'reports': 'Rapports & Stats',
        'my-reservations': 'Mes Réservations',
        'driver-trips': 'Mes Trajets',
        'driver-scan': 'Scanner QR',
        'publish-trip': 'Publier Départ',
        'chat': 'Chat',
        'reviews': 'Avis',
        'profile': 'Profil',
        'platform': 'Portail Trajets',
      };
      if (labelMapping[parts[i]]) label = labelMapping[parts[i]];
      if (parts[i] !== 'dashboard') {
        breadcrumbs.push({ label, url: currentUrl });
      }
    }
    return breadcrumbs;
  }

  // Close dropdowns on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper') && !target.closest('.quick-actions-wrapper')) {
      this.showNotifications = false;
      this.showQuickActions = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      // Command palette handles its own toggle
    }
    if (event.key === 'Escape') {
      this.showNotifications = false;
      this.showQuickActions = false;
      this.sidebarOpen.set(false);
    }
  }
}