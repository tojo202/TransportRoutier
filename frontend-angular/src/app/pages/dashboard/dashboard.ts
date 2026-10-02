import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { SectionBadgeComponent } from '../../shared/components/section-badge/section-badge.component';
import { StatCardsComponent, StatCard, REVENUE_STAT_CARDS, FLEET_STAT_GROUPS, SALES_STAT_GROUPS } from '../../shared/components/stat-cards/stat-cards.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatProgressSpinnerModule,
    RevealOnScrollDirective,
    SectionBadgeComponent,
    StatCardsComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent
  ],
  providers: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})

export class Dashboard implements OnInit, OnDestroy {
  stats: any = null;
  isLoading = true;
  error = '';
  
  selectedFilter: string = 'all';
  customStartDate: string = '';
  customEndDate: string = '';
  private refreshTimer: any;

  // Stat cards data
  mainStatCards: StatCard[] = [
    { id: 'reservations', label: 'Réservations', value: 0, icon: 'receipt', color: 'primary', route: '/reservations' },
    { id: 'tickets', label: 'Billets Vendus', value: 0, icon: 'confirmation_number', color: 'success', route: '/tickets' },
    { id: 'vehicles', label: 'Véhicules Dispo', value: 0, icon: 'directions_car', color: 'warning', route: '/vehicles' },
    { id: 'in-transit', label: 'En Trajet', value: 0, icon: 'local_shipping', color: 'info', route: '/schedules' },
    { id: 'drivers', label: 'Chauffeurs', value: 0, icon: 'badge', color: 'gold', route: '/drivers' },
    { id: 'baggage', label: 'Bagages', value: 0, icon: 'luggage', color: 'neutral', route: '/baggages' },
  ];

  revenueStatCards: StatCard[] = [
    { id: 'today', label: 'CA du Jour', value: 0, icon: 'today', color: 'gold', format: 'currency', subtitle: 'Aujourd\'hui' },
    { id: 'month', label: 'CA du Mois', value: 0, icon: 'calendar_month', color: 'primary', format: 'currency', subtitle: 'Ce mois' },
    { id: 'year', label: 'CA Annuel', value: 0, icon: 'bar_chart', color: 'success', format: 'currency', subtitle: 'Cette année' },
  ];

  fleetStatGroups = FLEET_STAT_GROUPS;
  salesStatGroups = SALES_STAT_GROUPS;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.refreshTimer = setInterval(() => {
      this.loadStats(false);
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  loadStats(showSpinner = true): void {
    if (showSpinner) {
      this.isLoading = true;
    }
    this.error = '';
    this.dashboardService.getStats(this.selectedFilter, this.customStartDate, this.customEndDate).subscribe({
      next: (data) => {
        this.stats = data;
        this.updateStatCards(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des statistiques.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  private updateStatCards(data: any): void {
    if (!data) return;
    
    // Update main stat cards
    this.mainStatCards = [
      { ...this.mainStatCards[0], value: data.total_reservations || 0, trend: data.reservations_trend },
      { ...this.mainStatCards[1], value: data.tickets_sold || 0, trend: data.tickets_trend },
      { ...this.mainStatCards[2], value: (data.total_vehicles || 0) - (data.vehicles_in_transit || 0), trend: data.vehicles_trend },
      { ...this.mainStatCards[3], value: data.vehicles_in_transit || 0, trend: data.transit_trend },
      { ...this.mainStatCards[4], value: data.total_drivers || 0, trend: data.drivers_trend },
      { ...this.mainStatCards[5], value: data.total_baggage || 0, trend: data.baggage_trend },
    ];

    // Update revenue cards
    this.revenueStatCards = [
      { ...this.revenueStatCards[0], value: data.today_revenue || 0 },
      { ...this.revenueStatCards[1], value: data.month_revenue || 0 },
      { ...this.revenueStatCards[2], value: data.year_revenue || 0 },
    ];

    // Update fleet groups
    this.fleetStatGroups = [
      {
        title: 'Flotte',
        columns: 4,
        cards: [
          { id: 'total-vehicles', label: 'Total Véhicules', value: data.total_vehicles || 0, icon: 'directions_bus', color: 'primary', route: '/vehicles' },
          { id: 'available', label: 'Disponibles', value: ((data.total_vehicles || 0) - (data.vehicles_in_transit || 0)), icon: 'check_circle', color: 'success', route: '/vehicles' },
          { id: 'in-transit', label: 'En Mission', value: data.vehicles_in_transit || 0, icon: 'local_shipping', color: 'warning', route: '/schedules' },
          { id: 'maintenance', label: 'Maintenance', value: data.vehicles_maintenance || 0, icon: 'build', color: 'danger', route: '/vehicles' },
        ],
      },
      {
        title: 'Chauffeurs',
        columns: 3,
        cards: [
          { id: 'total-drivers', label: 'Total Chauffeurs', value: data.total_drivers || 0, icon: 'badge', color: 'primary', route: '/drivers' },
          { id: 'active-drivers', label: 'Actifs', value: data.active_drivers || 0, icon: 'person', color: 'success', route: '/drivers' },
          { id: 'avg-rating', label: 'Note Moyenne', value: data.avg_driver_rating || 4.8, icon: 'star', color: 'gold', format: 'number', subtitle: '/ 5' },
        ],
      },
    ];

    // Update sales groups
    this.salesStatGroups = [
      {
        title: 'Réservations',
        columns: 4,
        cards: [
          { id: 'total-res', label: 'Total', value: data.total_reservations || 0, icon: 'receipt', color: 'primary', route: '/reservations' },
          { id: 'confirmed', label: 'Confirmées', value: data.confirmed_reservations || 0, icon: 'check_circle', color: 'success', route: '/reservations' },
          { id: 'pending', label: 'En Attente', value: data.pending_reservations || 0, icon: 'schedule', color: 'warning', route: '/reservations' },
          { id: 'cancelled', label: 'Annulées', value: data.cancelled_reservations || 0, icon: 'cancel', color: 'danger', route: '/reservations' },
        ],
      },
      {
        title: 'Finances',
        columns: 3,
        cards: [
          { id: 'today-rev', label: 'Aujourd\'hui', value: data.today_revenue || 0, icon: 'today', color: 'gold', format: 'currency' },
          { id: 'month-rev', label: 'Ce Mois', value: data.month_revenue || 0, icon: 'calendar_month', color: 'primary', format: 'currency' },
          { id: 'pending-pay', label: 'En Attente Paiement', value: data.pending_payments || 0, icon: 'pending', color: 'warning', route: '/payments' },
        ],
      },
    ];
  }

  onFilterChange(): void {
    if (this.selectedFilter !== 'custom') {
      this.loadStats();
    }
  }

  applyCustomFilter(): void {
    if (this.customStartDate && this.customEndDate) {
      this.loadStats();
    }
  }

  refreshDashboard(): void {
    this.loadStats();
  }

  viewAll(type: string): void {
    this.router.navigate([`/${type}`]);
  }
}
