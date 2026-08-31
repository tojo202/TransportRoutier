import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatProgressSpinnerModule,
    BaseChartDirective
  ],
  providers: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  stats: any = null;
  isLoading = true;
  error = '';
  
  selectedFilter: string = 'all';
  customStartDate: string = '';
  customEndDate: string = '';

  // Charts
  public barChartOptions: ChartOptions = { responsive: true };
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public pieChartOptions: ChartOptions = { responsive: true };
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;

  // Chart Data
  public resChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  public revChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  public occChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  public routeChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  public agencyChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  
  private monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.error = '';
    this.dashboardService.getStats(this.selectedFilter, this.customStartDate, this.customEndDate).subscribe({
      next: (data) => {
        this.stats = data;
        this.setupCharts();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des statistiques.';
        this.isLoading = false;
        console.error(err);
      }
    });
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

  setupCharts(): void {
    if (!this.stats?.charts) return;

    const COLORS = ['#556b2f','#7ba05b','#e76f51','#a3761d','#4d6e94','#c2543e','#4c7d34','#8aa868'];

    // Réservations par mois
    const resData = this.stats.charts.reservations_by_month ?? [];
    this.resChartData = {
      labels: resData.map((d: any) => this.monthNames[(d.month ?? 1) - 1]),
      datasets: resData.length ? [{
        data: resData.map((d: any) => d.count ?? 0),
        label: 'Réservations',
        backgroundColor: '#7ba05b',
        borderColor: '#556b2f',
        borderWidth: 2,
        borderRadius: 6
      }] : []
    };

    // Recettes par mois
    const revData = this.stats.charts.revenue_by_month ?? [];
    this.revChartData = {
      labels: revData.map((d: any) => this.monthNames[(d.month ?? 1) - 1]),
      datasets: revData.length ? [{
        data: revData.map((d: any) => d.total ?? 0),
        label: 'Recettes (Ar)',
        backgroundColor: '#4d6e94',
        borderColor: '#3a5270',
        borderWidth: 2,
        borderRadius: 6
      }] : []
    };

    // Occupation véhicules
    const occData = this.stats.charts.vehicle_occupancy ?? { labels: [], data: [] };
    this.occChartData = {
      labels: occData.labels ?? [],
      datasets: (occData.data?.length) ? [{
        data: occData.data,
        backgroundColor: COLORS
      }] : []
    };

    // Répartition trajets
    const routeData = this.stats.charts.routes_distribution ?? [];
    this.routeChartData = {
      labels: routeData.map((d: any) => d.name ?? ''),
      datasets: routeData.length ? [{
        data: routeData.map((d: any) => d.count ?? 0),
        backgroundColor: COLORS
      }] : []
    };

    // Stats agences
    const agencyData = this.stats.charts.agencies_stats ?? [];
    this.agencyChartData = {
      labels: agencyData.map((d: any) => d.name ?? ''),
      datasets: agencyData.length ? [{
        data: agencyData.map((d: any) => d.count ?? 0),
        backgroundColor: COLORS
      }] : []
    };
  }

  viewAll(type: string): void {
    this.router.navigate([`/${type}`]);
  }
}
