import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

export interface StatCard {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';
  trend?: {
    value: number;
    label: string;
    up: boolean;
  };
  route?: string;
  action?: () => void;
  subtitle?: string;
  format?: 'number' | 'currency' | 'percentage' | 'compact';
}

export interface StatCardGroup {
  title: string;
  cards: StatCard[];
  columns?: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-stat-cards',
  standalone: true,
  imports: [CommonModule, RouterModule, RevealOnScrollDirective],
  template: `
    @if (groupsSignal().length > 0) {
      @for (group of groupsSignal(); track group.title) {
        <section class="stat-cards-group" revealOnScroll revealClass="reveal-up" [revealDelay]="50">
          <header class="group-header">
            <h3 class="group-title">{{ group.title }}</h3>
            <span class="group-count" *ngIf="group.cards.length > 4">{{ group.cards.length }} indicateurs</span>
          </header>
          
          <div class="stat-cards-grid" [style.grid-template-columns]="getGridColumns(group.columns)">
            @for (card of group.cards; track card.id; let i = $index) {
              <article 
                class="stat-card" 
                [class.clickable]="card.route || card.action"
                [class.color-{{card.color}}]="true"
                revealOnScroll 
                revealClass="reveal-scale" 
                [revealDelay]="i * 50"
                (click)="onCardClick(card)"
                [routerLink]="card.route"
                role="button"
                tabindex="0"
                (keydown.enter)="onCardClick(card)"
                (keydown.space)="onCardClick(card)">
                
                <div class="stat-card-header">
                  <div class="stat-icon" [class]="'icon-' + card.color">
                    <span class="material-icons">{{ card.icon }}</span>
                  </div>
                  <span class="stat-label">{{ card.label }}</span>
                </div>
                
                <div class="stat-value-wrapper">
                  <div class="stat-value" [innerHTML]="formattedValue(card)"></div>
                  <div class="stat-subtitle" *ngIf="card.subtitle">{{ card.subtitle }}</div>
                </div>
                
                @if (card.trend) {
                  <div class="stat-trend" [class.up]="card.trend!.up" [class.down]="!card.trend!.up">
                    <span class="material-icons">{{ card.trend!.up ? 'trending_up' : 'trending_down' }}</span>
                    <span class="trend-value">{{ Math.abs(card.trend!.value) }}%</span>
                    <span class="trend-label">{{ card.trend!.label }}</span>
                  </div>
                }
                
                @if (card.route || card.action) {
                  <div class="stat-action-hint">
                    <span class="material-icons">open_in_new</span>
                    <span>Voir détails</span>
                  </div>
                }
              </article>
            }
          </div>
        </section>
      }
    }

    <!-- Single row stat cards (for page headers) -->
    @if (!groupedSignal() && cardsSignal().length > 0) {
      <div class="stat-cards-row" revealOnScroll revealClass="reveal-up">
        @for (card of cardsSignal(); track card.id; let i = $index) {
          <article 
            class="stat-card compact" 
            [class.clickable]="card.route || card.action"
            [class.color-{{card.color}}]="true"
            revealOnScroll 
            revealClass="reveal-scale" 
            [revealDelay]="i * 50"
            (click)="onCardClick(card)"
            [routerLink]="card.route"
            role="button"
            tabindex="0"
            (keydown.enter)="onCardClick(card)">
            
            <div class="stat-card-header">
              <div class="stat-icon" [class]="'icon-' + card.color">
                <span class="material-icons">{{ card.icon }}</span>
              </div>
              <span class="stat-label">{{ card.label }}</span>
            </div>
            
            <div class="stat-value-wrapper">
              <div class="stat-value" [innerHTML]="formattedValue(card)"></div>
            </div>
            
            @if (card.trend) {
              <div class="stat-trend" [class.up]="card.trend!.up" [class.down]="!card.trend!.up">
                <span class="material-icons">{{ card.trend!.up ? 'trending_up' : 'trending_down' }}</span>
                <span>{{ Math.abs(card.trend!.value) }}%</span>
              </div>
            }
          </article>
        }
      </div>
    }
  `,
  styles: [`
    .stat-cards-group {
      margin-bottom: 2.5rem;
    }

    .group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--border-color, #E2DAC8);
    }

    .group-title {
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-primary, #342419);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .group-title::before {
      content: '';
      width: 4px;
      height: 24px;
      background: var(--primary, #5B7036);
      border-radius: 2px;
    }

    .group-count {
      font-family: var(--font-main, 'Plus Jakarta Sans', sans-serif);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted, #958477);
      background: var(--surface, #FAF7F0);
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full, 9999px);
    }

    .stat-cards-grid {
      display: grid;
      gap: 1rem;
    }

    .stat-cards-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .stat-card {
      background: var(--card-bg, #FFFFFB);
      background-color: color-mix(in srgb, var(--card-bg, #FFFFFB) var(--card-bg-opacity), transparent);
      border-radius: var(--radius-lg, 18px);
      border: 2px solid var(--border-color, #E2DAC8);
      box-shadow: var(--shadow-md, 0 8px 24px rgba(52, 36, 25, 0.08));
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
      min-height: 150px;
      cursor: default;
    }

    .stat-card.compact {
      flex: 1;
      min-width: 200px;
      min-height: 120px;
      padding: 1.25rem;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: -30px;
      right: -30px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      opacity: 0.15;
      z-index: 0;
    }

    .stat-card:hover {
      transform: translateY(-6px) scale(1.01);
      box-shadow: var(--shadow-xl, 0 24px 60px rgba(52, 36, 25, 0.15));
      border-color: var(--border-strong, #CFC2A8);
    }

    .stat-card.clickable {
      cursor: pointer;
    }

    .stat-card.clickable:focus-visible {
      outline: 2px solid var(--primary, #5B7036);
      outline-offset: 2px;
    }

    .stat-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
      z-index: 1;
      margin-bottom: 0.75rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md, 14px);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(52, 36, 25, 0.1);
    }

    .stat-icon .material-icons { font-size: 24px; color: #FFFFFB; }

    .stat-icon.icon-primary { background: linear-gradient(135deg, #788E4B, #5B7036); }
    .stat-icon.icon-success { background: linear-gradient(135deg, #6AB05C, #4E7A42); }
    .stat-icon.icon-warning { background: linear-gradient(135deg, #DFB76C, #C5A059); }
    .stat-icon.icon-danger { background: linear-gradient(135deg, #C55A4A, #9E4732); }
    .stat-icon.icon-info { background: linear-gradient(135deg, #5D7E64, #48624E); }
    .stat-icon.icon-neutral { background: linear-gradient(135deg, #B8A898, #958477); }
    .stat-icon.icon-gold { background: linear-gradient(135deg, #E8C56D, #C5A059); }

    .stat-label {
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-secondary, #635043);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-align: right;
      line-height: 1.3;
      max-width: 140px;
    }

    .stat-card.compact .stat-label { font-size: 0.75rem; max-width: 120px; }

    .stat-value-wrapper {
      position: relative;
      z-index: 1;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary, #342419);
      line-height: 1.1;
    }

    .stat-card.compact .stat-value { font-size: 2rem; }

    .stat-subtitle {
      font-family: var(--font-main, 'Plus Jakarta Sans', sans-serif);
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-muted, #958477);
      margin-top: 0.25rem;
    }

    .stat-trend {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full, 9999px);
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 0.75rem;
      font-weight: 700;
      position: relative;
      z-index: 1;
      align-self: flex-start;
    }

    .stat-trend.up { background: var(--success-light, #EAF2E8); color: var(--success, #4E7A42); }
    .stat-trend.down { background: var(--danger-light, #F8EBE8); color: var(--danger, #9E4732); }

    .stat-trend .material-icons { font-size: 16px; }

    .trend-value { font-weight: 800; }
    .trend-label { opacity: 0.8; font-weight: 600; }

    .stat-action-hint {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: auto;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color, #E2DAC8);
      font-family: var(--font-main, 'Plus Jakarta Sans', sans-serif);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted, #958477);
      opacity: 0;
      transform: translateY(8px);
      transition: all 0.2s ease;
    }

    .stat-card:hover .stat-action-hint {
      opacity: 1;
      transform: translateY(0);
    }

    .stat-action-hint .material-icons { font-size: 16px; }

    /* Color variants for card borders on hover */
    .stat-card.color-primary:hover { border-color: var(--primary, #5B7036); }
    .stat-card.color-success:hover { border-color: var(--success, #4E7A42); }
    .stat-card.color-warning:hover { border-color: var(--gold, #C5A059); }
    .stat-card.color-danger:hover { border-color: var(--danger, #9E4732); }
    .stat-card.color-info:hover { border-color: var(--info, #48624E); }
    .stat-card.color-neutral:hover { border-color: var(--text-muted, #958477); }
    .stat-card.color-gold:hover { border-color: var(--gold, #C5A059); }

    @media (max-width: 1024px) {
      .stat-cards-grid {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
      }
    }

    @media (max-width: 640px) {
      .stat-cards-grid,
      .stat-cards-row {
        grid-template-columns: 1fr !important;
      }
      
      .stat-card { min-width: 0; }
      
      .group-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    }
  `]
})
export class StatCardsComponent {
  @Input() cards: StatCard[] = [];
  @Input() groups: StatCardGroup[] = [];
  @Input() grouped: boolean = false;

  cardsSignal = computed(() => this.cards);
  groupsSignal = computed(() => this.groups);
  groupedSignal = computed(() => this.grouped);

  Math = Math;

  getGridColumns(columns?: number): string {
    const cols = columns || 4;
    return `repeat(auto-fit, minmax(220px, 1fr))`;
  }

  formattedValue(card: StatCard): string {
    const value = Number(card.value);
    switch (card.format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);
      case 'percentage':
        return value.toFixed(1) + '%';
      case 'compact':
        return Intl.NumberFormat('fr-FR', { notation: 'compact', compactDisplay: 'short' }).format(value);
      case 'number':
      default:
        return Intl.NumberFormat('fr-FR').format(value);
    }
  }

  onCardClick(card: StatCard): void {
    if (card.action) {
      card.action();
    }
    // RouterLink handles navigation automatically
  }
}

/* Predefined stat card configurations for common pages */
export const DASHBOARD_STAT_CARDS: StatCard[] = [
  { id: 'reservations', label: 'Réservations', value: 0, icon: 'receipt', color: 'primary', route: '/reservations' },
  { id: 'tickets', label: 'Billets Vendus', value: 0, icon: 'confirmation_number', color: 'success', route: '/tickets' },
  { id: 'vehicles', label: 'Véhicules Dispo', value: 0, icon: 'directions_car', color: 'warning', route: '/vehicles' },
  { id: 'in-transit', label: 'En Trajet', value: 0, icon: 'local_shipping', color: 'info', route: '/schedules' },
  { id: 'drivers', label: 'Chauffeurs', value: 0, icon: 'badge', color: 'gold', route: '/drivers' },
  { id: 'baggage', label: 'Bagages', value: 0, icon: 'luggage', color: 'neutral', route: '/baggages' },
];

export const REVENUE_STAT_CARDS: StatCard[] = [
  { id: 'today', label: 'CA du Jour', value: 0, icon: 'today', color: 'gold', format: 'currency', subtitle: 'Aujourd\'hui' },
  { id: 'month', label: 'CA du Mois', value: 0, icon: 'calendar_month', color: 'primary', format: 'currency', subtitle: 'Ce mois' },
  { id: 'year', label: 'CA Annuel', value: 0, icon: 'bar_chart', color: 'success', format: 'currency', subtitle: 'Cette année' },
];

export const FLEET_STAT_GROUPS: StatCardGroup[] = [
  {
    title: 'Flotte',
    columns: 4,
    cards: [
      { id: 'total-vehicles', label: 'Total Véhicules', value: 0, icon: 'directions_bus', color: 'primary', route: '/vehicles' },
      { id: 'available', label: 'Disponibles', value: 0, icon: 'check_circle', color: 'success', route: '/vehicles' },
      { id: 'in-transit', label: 'En Mission', value: 0, icon: 'local_shipping', color: 'warning', route: '/schedules' },
      { id: 'maintenance', label: 'Maintenance', value: 0, icon: 'build', color: 'danger', route: '/vehicles' },
    ],
  },
  {
    title: 'Chauffeurs',
    columns: 3,
    cards: [
      { id: 'total-drivers', label: 'Total Chauffeurs', value: 0, icon: 'badge', color: 'primary', route: '/drivers' },
      { id: 'active-drivers', label: 'Actifs', value: 0, icon: 'person', color: 'success', route: '/drivers' },
      { id: 'avg-rating', label: 'Note Moyenne', value: 4.8, icon: 'star', color: 'gold', format: 'number', subtitle: '/ 5' },
    ],
  },
];

export const SALES_STAT_GROUPS: StatCardGroup[] = [
  {
    title: 'Réservations',
    columns: 4,
    cards: [
      { id: 'total-res', label: 'Total', value: 0, icon: 'receipt', color: 'primary', route: '/reservations' },
      { id: 'confirmed', label: 'Confirmées', value: 0, icon: 'check_circle', color: 'success', route: '/reservations' },
      { id: 'pending', label: 'En Attente', value: 0, icon: 'schedule', color: 'warning', route: '/reservations' },
      { id: 'cancelled', label: 'Annulées', value: 0, icon: 'cancel', color: 'danger', route: '/reservations' },
    ],
  },
  {
    title: 'Finances',
    columns: 3,
    cards: [
      { id: 'today-rev', label: 'Aujourd\'hui', value: 0, icon: 'today', color: 'gold', format: 'currency' },
      { id: 'month-rev', label: 'Ce Mois', value: 0, icon: 'calendar_month', color: 'primary', format: 'currency' },
      { id: 'pending-pay', label: 'En Attente Paiement', value: 0, icon: 'pending', color: 'warning', route: '/payments' },
    ],
  },
];