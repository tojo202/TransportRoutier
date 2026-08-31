import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReportService } from '../../services/report';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { VerticalPaginationComponent } from '../../components/vertical-pagination/vertical-pagination';

@Component({
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
    VerticalPaginationComponent
  , NgxPaginationModule],
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

  columns: string[] = [];

  constructor(private reportService: ReportService, private datePipe: DatePipe) {}

  // Pagination
  page = 1;
  perPage = 20;
  totalPages = 1;
  ngOnInit(): void {
    this.generateReport();
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
      // Very basic text search for demo
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
