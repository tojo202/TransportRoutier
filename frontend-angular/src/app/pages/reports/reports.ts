import { NgxPaginationModule } from 'ngx-pagination';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReportService } from '../../services/report';
import { DashboardService } from '../../services/dashboard';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { VerticalPaginationComponent } from '../../components/vertical-pagination/vertical-pagination';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    BaseChartDirective,
    VerticalPaginationComponent,
    NgxPaginationModule
  ],
  providers: [DatePipe],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class ReportsComponent implements OnInit {
  p: number = 1;
  reportType = 'reservations';
  startDate = '';
  endDate = '';
  
  data: any[] = [];
  filteredData: any[] = [];
  searchTerm = '';
  isLoading = false;
  statsData: any = null;

  columns: string[] = [];

  // Config Graphiques
  public barChartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false };
  public barChartType: ChartType = 'bar';
  public pieChartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false };
  public pieChartType: ChartType = 'pie';

  public resChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  public revChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  public occChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  public routeChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  public agencyChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };

  private monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

  constructor(
    private reportService: ReportService,
    private dashboardService: DashboardService,
    private datePipe: DatePipe
  ) {}

  // Pagination
  page = 1;
  perPage = 20;
  totalPages = 1;

  ngOnInit(): void {
    this.generateReport();
    this.loadChartStats();
  }

  loadChartStats(): void {
    this.dashboardService.getStats('all', this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.statsData = data;
        this.setupCharts();
      },
      error: (err) => console.error('Erreur chargement graphiques rapports:', err)
    });
  }

  setupCharts(): void {
    if (!this.statsData?.charts) return;
    const COLORS = ['#5B7036', '#C5A059', '#342419', '#788E4B', '#DFB76C', '#635043', '#8A9F63', '#A68037'];

    const resData = this.statsData.charts.reservations_by_month ?? [];
    this.resChartData = {
      labels: resData.map((d: any) => this.monthNames[(d.month ?? 1) - 1]),
      datasets: resData.length ? [{
        data: resData.map((d: any) => d.count ?? 0),
        label: 'Réservations',
        backgroundColor: '#788E4B',
        borderColor: '#5B7036',
        borderWidth: 1.5,
        borderRadius: 6
      }] : []
    };

    const revData = this.statsData.charts.revenue_by_month ?? [];
    this.revChartData = {
      labels: revData.map((d: any) => this.monthNames[(d.month ?? 1) - 1]),
      datasets: revData.length ? [{
        data: revData.map((d: any) => d.total ?? 0),
        label: 'Recettes (Ar)',
        backgroundColor: '#C5A059',
        borderColor: '#99752D',
        borderWidth: 1.5,
        borderRadius: 6
      }] : []
    };

    const occData = this.statsData.charts.vehicle_occupancy ?? { labels: [], data: [] };
    this.occChartData = {
      labels: occData.labels ?? [],
      datasets: (occData.data?.length) ? [{
        data: occData.data,
        backgroundColor: COLORS
      }] : []
    };

    const routeData = this.statsData.charts.routes_distribution ?? [];
    this.routeChartData = {
      labels: routeData.map((d: any) => d.name ?? ''),
      datasets: routeData.length ? [{
        data: routeData.map((d: any) => d.count ?? 0),
        backgroundColor: COLORS
      }] : []
    };

    const agencyData = this.statsData.charts.agencies_stats ?? [];
    this.agencyChartData = {
      labels: agencyData.map((d: any) => d.name ?? ''),
      datasets: agencyData.length ? [{
        data: agencyData.map((d: any) => d.count ?? 0),
        backgroundColor: COLORS
      }] : []
    };
  }

  generateReport(): void {
    this.isLoading = true;
    this.reportService.getReport(this.reportType, this.startDate, this.endDate).subscribe({
      next: (res) => {
        this.data = res;
        this.applyFilter();
        this.setupColumns();
        this.totalPages = Math.max(1, Math.ceil(this.filteredData.length / this.perPage));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
    this.loadChartStats();
  }

  onPageChange(page: number) { this.page = page; }

  setupColumns(): void {
    if (this.reportType === 'reservations') {
      this.columns = ['ID', 'Client', 'Date', 'Statut', 'Prix'];
    } else if (this.reportType === 'payments') {
      this.columns = ['ID', 'Client', 'Date Paiement', 'Montant', 'Statut'];
    } else if (this.reportType === 'tickets') {
      this.columns = ['ID', 'Passager', 'Date Création', 'Siège', 'Statut'];
    }
  }

  getRowData(item: any): any[] {
    if (this.reportType === 'reservations') {
      return [
        item.id, 
        item.user?.name || 'N/A', 
        this.datePipe.transform(item.created_at, 'short'), 
        item.status, 
        item.total_price + ' Ar'
      ];
    } else if (this.reportType === 'payments') {
      return [
        item.id, 
        item.reservation?.user?.name || 'N/A', 
        this.datePipe.transform(item.payment_date, 'short'), 
        item.amount + ' Ar', 
        item.status
      ];
    } else if (this.reportType === 'tickets') {
      return [
        item.id, 
        item.reservation?.user?.name || 'N/A', 
        this.datePipe.transform(item.created_at, 'short'), 
        item.seat_number, 
        item.status
      ];
    }
    return [];
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredData = this.data.filter(item => {
      return JSON.stringify(item).toLowerCase().includes(term);
    });
  }

  exportExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    XLSX.writeFile(wb, `rapport_${this.reportType}.xlsx`);
  }

  exportPDF(): void {
    const doc = new jsPDF();
    doc.text(`Rapport - ${this.reportType.toUpperCase()}`, 14, 15);
    
    const bodyData = this.filteredData.map(item => this.getRowData(item));
    
    (doc as any).autoTable({
      head: [this.columns],
      body: bodyData,
      startY: 20
    });
    
    doc.save(`rapport_${this.reportType}.pdf`);
  }

  printReport(): void {
    window.print();
  }
}
