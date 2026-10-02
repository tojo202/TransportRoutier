import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../services/toast.service';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  category: string;
  route?: string;
  action?: () => void;
  shortcut?: string;
  keywords?: string[];
  roles?: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div 
      class="command-palette-overlay" 
      *ngIf="isOpen()" 
      (click)="close()"
      @fadeIn>
      <div 
        class="command-palette" 
        (click)="$event.stopPropagation()"
        @slideIn>
        
        <!-- Header -->
        <div class="command-header">
          <div class="command-search-wrapper">
            <span class="material-icons search-icon">search</span>
            <input 
              #searchInput
              type="text" 
              class="command-search" 
              placeholder="Tapez une commande ou recherchez..." 
              [(ngModel)]="query"
              (input)="onQueryChange()"
              (keydown)="onKeyDown($event)"
              autocomplete="off"
              spellcheck="false"
              aria-label="Commande palette search" />
            <kbd class="command-shortcut">⌘K</kbd>
          </div>
        </div>

        <!-- Results -->
        <div class="command-results" *ngIf="filteredItems().length > 0">
          @for (group of groupedItems(); track group.category) {
            <div class="command-group">
              <div class="command-group-label">{{ group.category }}</div>
              @for (item of group.items; track item.id; let i = $index) {
                <button
                  class="command-item"
                  [class.selected]="selectedIndex() === getGlobalIndex(group.category, i)"
                  [class.has-action]="!!item.action"
                  (click)="executeItem(item)"
                  (mouseenter)="setSelectedIndex(getGlobalIndex(group.category, i))"
                  type="button">
                  
                  <span class="command-item-icon" *ngIf="item.icon">
                    <span class="material-icons">{{ item.icon }}</span>
                  </span>
                  
                  <div class="command-item-content">
                    <span class="command-item-label">{{ item.label }}</span>
                    <span class="command-item-description" *ngIf="item.description">{{ item.description }}</span>
                  </div>
                  
                  <span class="command-item-shortcut" *ngIf="item.shortcut">{{ item.shortcut }}</span>
                  <span class="command-item-route" *ngIf="item.route && !item.action">{{ item.route }}</span>
                </button>
              }
            </div>
          }
        </div>

        <!-- Empty state -->
        <div class="command-empty" *ngIf="filteredItems().length === 0 && query()">
          <span class="material-icons">search_off</span>
          <p>Aucune commande trouvée pour "{{ query() }}"</p>
          <span class="command-empty-hint">Essayez avec d'autres mots-clés</span>
        </div>

        <!-- Default suggestions -->
        <div class="command-suggestions" *ngIf="!query() && filteredItems().length === 0">
          <div class="command-group">
            <div class="command-group-label">Suggestions</div>
            @for (item of recentItems(); track item.id; let i = $index) {
              <button
                class="command-item"
                [class.selected]="selectedIndex() === i"
                (click)="executeItem(item)"
                (mouseenter)="setSelectedIndex(i)"
                type="button">
                <span class="command-item-icon">
                  <span class="material-icons">{{ item.icon }}</span>
                </span>
                <div class="command-item-content">
                  <span class="command-item-label">{{ item.label }}</span>
                  <span class="command-item-description">{{ item.description }}</span>
                </div>
                <kbd class="command-item-shortcut">{{ item.shortcut }}</kbd>
              </button>
            }
          </div>
        </div>

        <!-- Footer -->
        <div class="command-footer">
          <div class="command-footer-left">
            <span class="command-hint">
              <span class="material-icons">keyboard_arrow_up</span>
              <span class="material-icons">keyboard_arrow_down</span>
              Naviguer
            </span>
            <span class="command-divider">|</span>
            <span class="command-hint">
              <span class="material-icons">arrow_right</span>
              Exécuter
            </span>
            <span class="command-divider">|</span>
            <span class="command-hint">
              <span class="material-icons">close</span>
              Fermer
            </span>
          </div>
          <div class="command-footer-right">
            <span class="command-version">TransExpress v1.0</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0; 
        transform: translateY(-20px) scale(0.97); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }

    .command-palette-overlay {
      position: fixed;
      inset: 0;
      background: rgba(52, 36, 25, 0.5);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 10vh;
      animation: fadeIn 0.15s ease-out;
    }

    .command-palette {
      width: min(680px, 92vw);
      background: var(--card-bg, #FFFFFB);
      border: 2px solid var(--border-color, #E2DAC8);
      border-radius: var(--radius-xl, 24px);
      box-shadow: 
        0 24px 60px rgba(52, 36, 25, 0.25),
        0 0 0 1px rgba(197, 160, 89, 0.1);
      overflow: hidden;
      animation: slideIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .command-header {
      padding: 1rem 1.25rem;
      border-bottom: 2px solid var(--border-color, #E2DAC8);
      background: var(--surface, #FAF7F0);
    }

    .command-search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .search-icon {
      color: var(--text-muted, #958477);
      font-size: 22px;
      flex-shrink: 0;
    }

    .command-search {
      flex: 1;
      border: none;
      background: transparent;
      font-family: var(--font-main, 'Plus Jakarta Sans', sans-serif);
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--text-primary, #342419);
      outline: none;
      width: 100%;
    }

    .command-search::placeholder {
      color: var(--text-muted, #958477);
      font-weight: 400;
    }

    .command-shortcut {
      background: var(--bg-secondary, #EFE9DC);
      border: 1px solid var(--border-color, #E2DAC8);
      border-radius: var(--radius-sm, 10px);
      padding: 0.2rem 0.6rem;
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted, #958477);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .command-results {
      max-height: 50vh;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .command-group {
      margin-bottom: 0.5rem;
    }

    .command-group-label {
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted, #958477);
      padding: 0.5rem 1rem 0.25rem;
    }

    .command-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      border-radius: var(--radius-md, 14px);
      cursor: pointer;
      text-align: left;
      transition: all 0.1s ease;
      font-family: var(--font-main, 'Plus Jakarta Sans', sans-serif);
    }

    .command-item:hover,
    .command-item.selected {
      background: var(--primary-light, #EBF0E3);
    }

    .command-item:focus-visible {
      outline: 2px solid var(--primary, #5B7036);
      outline-offset: -2px;
    }

    .command-item-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm, 10px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface, #FAF7F0);
      border: 1px solid var(--border-color, #E2DAC8);
      color: var(--primary, #5B7036);
      font-size: 18px;
      flex-shrink: 0;
    }

    .command-item.selected .command-item-icon {
      background: var(--primary, #5B7036);
      color: #FFFFFB;
      border-color: var(--primary, #5B7036);
    }

    .command-item-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .command-item-label {
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary, #342419);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .command-item.selected .command-item-label {
      color: var(--primary, #5B7036);
    }

    .command-item-description {
      font-size: 0.8rem;
      font-weight: 400;
      color: var(--text-muted, #958477);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .command-item-shortcut {
      background: var(--bg-secondary, #EFE9DC);
      border: 1px solid var(--border-color, #E2DAC8);
      border-radius: var(--radius-sm, 10px);
      padding: 0.15rem 0.5rem;
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted, #958477);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .command-item-route {
      font-family: var(--font-main, 'Plus Jakarta Sans', sans-serif);
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--text-muted, #958477);
      flex-shrink: 0;
    }

    .command-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      color: var(--text-muted, #958477);
      gap: 0.5rem;
    }

    .command-empty .material-icons {
      font-size: 48px;
      opacity: 0.5;
    }

    .command-empty p {
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-secondary, #635043);
      margin: 0;
    }

    .command-empty-hint {
      font-size: 0.8rem;
      font-weight: 400;
    }

    .command-suggestions {
      padding: 0.5rem;
    }

    .command-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      border-top: 2px solid var(--border-color, #E2DAC8);
      background: var(--surface, #FAF7F0);
      font-size: 0.75rem;
      color: var(--text-muted, #958477);
    }

    .command-footer-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .command-hint {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-family: var(--font-main, 'Plus Jakarta Sans', sans-serif);
      font-weight: 500;
    }

    .command-hint .material-icons {
      font-size: 14px;
    }

    .command-divider {
      opacity: 0.4;
    }

    .command-version {
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-weight: 700;
      color: var(--gold-strong, #99752D);
    }

    @media (max-width: 480px) {
      .command-palette-overlay {
        padding-top: 0;
        align-items: stretch;
      }
      .command-palette {
        border-radius: 0;
        height: 100vh;
        max-height: 100vh;
      }
      .command-results {
        max-height: calc(100vh - 200px);
      }
    }
  `],
  animations: []
})
export class CommandPaletteComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  isOpen = signal(false);
  query = signal('');
  selectedIndex = signal(0);
  recentCommands = signal<CommandItem[]>([]);

  allItems = computed(() => this.buildCommandItems());
  filteredItems = computed(() => this.filterItems());
  groupedItems = computed(() => this.groupItems());
  recentItems = computed(() => this.getRecentItems());

  private subscription: any;
  private previousFocus: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.addToRecent(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.toggle();
    }
    if (event.key === 'Escape' && this.isOpen()) {
      this.close();
    }
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.previousFocus = document.activeElement as HTMLElement;
    this.isOpen.set(true);
    this.query.set('');
    this.selectedIndex.set(0);
    
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 50);
  }

  close(): void {
    this.isOpen.set(false);
    this.query.set('');
    this.selectedIndex.set(0);
    
    setTimeout(() => {
      this.previousFocus?.focus();
    }, 100);
  }

  onQueryChange(): void {
    this.selectedIndex.set(0);
  }

  onKeyDown(event: KeyboardEvent): void {
    const items = this.filteredItems();
    const maxIndex = items.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update(i => Math.min(i + 1, maxIndex));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        const selectedItem = items[this.selectedIndex()];
        if (selectedItem) {
          this.executeItem(selectedItem);
        }
        break;
      case 'Escape':
        this.close();
        break;
    }
  }

  setSelectedIndex(index: number): void {
    this.selectedIndex.set(index);
  }

  getGlobalIndex(category: string, localIndex: number): number {
    const groups = this.groupedItems();
    let index = 0;
    for (const group of groups) {
      if (group.category === category) {
        return index + localIndex;
      }
      index += group.items.length;
    }
    return index + localIndex;
  }

  executeItem(item: CommandItem): void {
    this.addToRecent(item.route || item.id);
    
    if (item.action) {
      Promise.resolve(item.action()).then(() => {
        if (!item.route) this.close();
      });
    } else if (item.route) {
      this.router.navigateByUrl(item.route).then(() => this.close());
    }
  }

  private buildCommandItems(): CommandItem[] {
    const user = this.authService.currentUserSync();
    const role = user?.role || 'client';
    const isAdmin = role === 'admin';
    const isAgent = role === 'agent';
    const isDriver = role === 'driver';
    const isClient = role === 'client';

    const items: CommandItem[] = [
      // Navigation principale
      { id: 'dashboard', label: 'Tableau de bord', description: 'Vue d\'ensemble des indicateurs', icon: 'dashboard', category: 'Navigation', route: '/dashboard', shortcut: '⌘1', roles: ['admin', 'agent'], keywords: ['dashboard', 'stats', 'indicateurs', 'accueil'] },
      { id: 'platform', label: 'Portail Trajets', description: 'Rechercher et réserver un trajet', icon: 'public', category: 'Navigation', route: '/platform', shortcut: '⌘2', roles: ['admin', 'agent', 'client'], keywords: ['trajet', 'voyage', 'recherche', 'réserver'] },
      { id: 'my-reservations', label: 'Mes Réservations', description: 'Voir mes billets et QR codes', icon: 'receipt_long', category: 'Navigation', route: '/my-reservations', shortcut: '⌘3', roles: ['client'], keywords: ['réservation', 'billet', 'qr', 'code'] },

      // Gestion (Admin/Agent)
      { id: 'reservations', label: 'Réservations', description: 'Gérer toutes les réservations', icon: 'confirmation_number', category: 'Gestion', route: '/reservations', shortcut: '⌘R', roles: ['admin', 'agent'], keywords: ['réservation', 'booking', 'gérer', 'liste'] },
      { id: 'tickets', label: 'Billetterie', description: 'Gestion des billets émis', icon: 'receipt_long', category: 'Gestion', route: '/tickets', roles: ['admin', 'agent'], keywords: ['billet', 'ticket', 'émission', 'scan'] },
      { id: 'payments', label: 'Paiements', description: 'Suivi des transactions', icon: 'payments', category: 'Gestion', route: '/payments', roles: ['admin', 'agent'], keywords: ['paiement', 'transaction', 'wave', 'orange money'] },
      { id: 'baggages', label: 'Bagages', description: 'Enregistrement et suivi bagages', icon: 'luggage', category: 'Gestion', route: '/baggages', roles: ['admin', 'agent'], keywords: ['bagage', 'valise', 'enregistrement', 'soute'] },

      // Flotte & Réseau (Admin)
      { id: 'agencies', label: 'Agences', description: 'Gérer les agences', icon: 'apartment', category: 'Flotte & Réseau', route: '/agencies', roles: ['admin'], keywords: ['agence', 'bureau', 'site', 'localisation'] },
      { id: 'vehicles', label: 'Véhicules', description: 'Gérer la flotte de véhicules', icon: 'directions_bus', category: 'Flotte & Réseau', route: '/vehicles', roles: ['admin'], keywords: ['véhicule', 'bus', 'car', 'flotte', 'immatriculation'] },
      { id: 'drivers', label: 'Chauffeurs', description: 'Gérer les conducteurs', icon: 'badge', category: 'Flotte & Réseau', route: '/drivers', roles: ['admin'], keywords: ['chauffeur', 'conducteur', 'permis', 'expérience'] },
      { id: 'routes', label: 'Lignes & Trajets', description: 'Définir les lignes du réseau', icon: 'alt_route', category: 'Flotte & Réseau', route: '/routes', roles: ['admin'], keywords: ['ligne', 'trajet', 'origine', 'destination', 'distance'] },
      { id: 'schedules', label: 'Horaires & Départs', description: 'Programmer les départs', icon: 'schedule', category: 'Flotte & Réseau', route: '/schedules', roles: ['admin', 'driver'], keywords: ['horaire', 'départ', 'arrivée', 'planning', 'programmer'] },

      // Espace Chauffeur
      { id: 'driver-trips', label: 'Mes Trajets', description: 'Voir mes missions assignées', icon: 'directions_bus', category: 'Espace Chauffeur', route: '/driver-trips', shortcut: '⌘T', roles: ['driver'], keywords: ['trajet', 'mission', 'conduire', 'passagers'] },
      { id: 'driver-scan', label: 'Scanner QR', description: 'Valider les billets passagers', icon: 'qr_code_scanner', category: 'Espace Chauffeur', route: '/driver-scan', shortcut: '⌘S', roles: ['driver', 'agent'], keywords: ['scan', 'qr', 'valider', 'billet', 'embarquement'] },
      { id: 'publish-trip', label: 'Publier un départ', description: 'Créer un nouveau trajet', icon: 'add_circle', category: 'Espace Chauffeur', route: '/publish-trip', roles: ['driver'], keywords: ['publier', 'créer', 'nouveau', 'départ', 'trajet'] },
      { id: 'chat', label: 'Chat Passagers', description: 'Communiquer avec les voyageurs', icon: 'chat', category: 'Espace Chauffeur', route: '/chat', roles: ['driver', 'client'], keywords: ['chat', 'message', 'discussion', 'passager'] },
      { id: 'reviews', label: 'Mes Évaluations', description: 'Voir les avis reçus', icon: 'star', category: 'Espace Chauffeur', route: '/reviews', roles: ['driver', 'client'], keywords: ['avis', 'évaluation', 'note', 'étoile', 'review'] },

      // Rapports & Admin
      { id: 'reports', label: 'Rapports & Stats', description: 'Analyses et exports', icon: 'analytics', category: 'Rapports', route: '/reports', roles: ['admin'], keywords: ['rapport', 'stat', 'export', 'pdf', 'excel', 'analyse'] },
      { id: 'profile', label: 'Mon Profil', description: 'Paramètres du compte', icon: 'person', category: 'Compte', route: '/profile', shortcut: '⌘P', roles: ['admin', 'agent', 'driver', 'client'], keywords: ['profil', 'compte', 'paramètres', 'mot de passe'] },

      // Actions rapides
      { id: 'new-reservation', label: 'Nouvelle réservation', description: 'Créer une réservation rapide', icon: 'add_circle', category: 'Actions', action: () => { this.router.navigateByUrl('/platform'); }, roles: ['admin', 'agent'], shortcut: '⌘N', keywords: ['nouveau', 'créer', 'réserver', 'ajouter'] },
      { id: 'refresh', label: 'Actualiser les données', description: 'Recharger la page courante', icon: 'refresh', category: 'Actions', action: () => { window.location.reload(); }, shortcut: '⌘R', keywords: ['actualiser', 'recharger', 'refresh', 'reload'] },
      { id: 'logout', label: 'Déconnexion', description: 'Se déconnecter de l\'application', icon: 'logout', category: 'Compte', action: () => { this.authService.logout().subscribe(); }, keywords: ['déconnexion', 'logout', 'sortir', 'quitter'] },
    ];

    return items.filter(item => !item.roles || item.roles.includes(role));
  }

  private filterItems(): CommandItem[] {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];

    return this.allItems().filter(item => {
      const searchText = [
        item.label,
        item.description,
        ...(item.keywords || []),
        item.category,
      ].join(' ').toLowerCase();

      return searchText.includes(q);
    });
  }

  private groupItems(): { category: string; items: CommandItem[] }[] {
    const items = this.filteredItems();
    const groups = new Map<string, CommandItem[]>();

    for (const item of items) {
      if (!groups.has(item.category)) {
        groups.set(item.category, []);
      }
      groups.get(item.category)!.push(item);
    }

    const categoryOrder = ['Navigation', 'Actions', 'Gestion', 'Flotte & Réseau', 'Espace Chauffeur', 'Rapports', 'Compte'];
    
    return Array.from(groups.entries())
      .map(([category, items]) => ({ category, items }))
      .sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a.category);
        const bIndex = categoryOrder.indexOf(b.category);
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      });
  }

  private getRecentItems(): CommandItem[] {
    const recent = this.recentCommands();
    if (recent.length > 0) return recent.slice(0, 5);
    
    // Default suggestions based on role
    const user = this.authService.currentUserSync();
    const role = user?.role || 'client';
    
    const defaults: CommandItem[] = [
      { id: 'platform', label: 'Portail Trajets', description: 'Rechercher un trajet', icon: 'public', category: 'Suggestions', route: '/platform', shortcut: '⌘2' },
      { id: 'dashboard', label: 'Tableau de bord', description: 'Indicateurs globaux', icon: 'dashboard', category: 'Suggestions', route: '/dashboard', shortcut: '⌘1' },
      { id: 'my-reservations', label: 'Mes Réservations', description: 'Voir mes billets', icon: 'receipt_long', category: 'Suggestions', route: '/my-reservations', shortcut: '⌘3' },
      { id: 'profile', label: 'Mon Profil', description: 'Paramètres du compte', icon: 'person', category: 'Suggestions', route: '/profile', shortcut: '⌘P' },
    ];

    return defaults.filter(item => 
      role === 'client' ? ['platform', 'my-reservations', 'profile'].includes(item.id) : true
    ).slice(0, 4);
  }

  private addToRecent(route: string): void {
    const existing = this.allItems().find(i => i.route === route || i.id === route);
    if (existing) {
      this.recentCommands.update(current => {
        const filtered = current.filter(c => c.id !== existing.id);
        return [existing, ...filtered].slice(0, 10);
      });
    }
  }
}

// Add to AuthService for sync access
declare module '../../../services/auth' {
  interface AuthService {
    currentUserSync(): { role: string } | null;
  }
}