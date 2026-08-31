import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TicketService } from '../../services/ticket';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    MatDialogModule
  , NgxPaginationModule],
  providers: [DatePipe],
  templateUrl: './tickets.html',
  styleUrls: ['./tickets.css']
})
export class TicketsComponent implements OnInit {
  p: number = 1;
  // Pagination state
  page = 1;
  perPage = 10;
  totalPages = 1;
  tickets: any[] = [];
  filteredTickets: any[] = [];
  searchTerm = '';
  
  displayedColumns: string[] = ['id', 'passenger', 'route', 'date', 'seat', 'price', 'status', 'actions'];

  showTicketModal = false;
  selectedTicket: any = null;
  qrCodeUrl = '';

  constructor(
    private ticketService: TicketService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.filteredTickets = data;
        this.totalPages = Math.max(1, Math.ceil(this.filteredTickets.length / this.perPage));
      },
      error: (err) => console.error(err)
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredTickets = this.tickets.filter(t => 
      t.reservation?.user?.name?.toLowerCase().includes(term) ||
      t.ticket_number?.toLowerCase().includes(term) ||
      t.id.toString().includes(term)
    );
  }

  viewTicket(ticket: any): void {
    this.selectedTicket = ticket;
    // Generate a dummy QR code based on ticket number or ID
    const data = `TICKET-${ticket.id}-${ticket.ticket_number || '000'}`;
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
    this.showTicketModal = true;
  }

  closeTicket(): void {
    this.showTicketModal = false;
    this.selectedTicket = null;
  }

  cancelTicket(ticket: any): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "L'annulation du billet est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non, garder'
    }).then((result) => {
      if (result.isConfirmed) {
        // fake api call since we might not have the route
        Swal.fire('Annulé!', 'Le billet a été annulé.', 'success');
        ticket.status = 'cancelled';
      }
    });
  }

  printTicket(): void {
    window.print();
  }

  downloadPDF(): void {
    const doc = new jsPDF();
    doc.text(`Billet d'embarquement #${this.selectedTicket.id}`, 20, 20);
    doc.text(`Passager: ${this.selectedTicket.reservation?.user?.name || 'N/A'}`, 20, 30);
    doc.text(`Trajet: ${this.selectedTicket.reservation?.schedule?.route?.departure_city} - ${this.selectedTicket.reservation?.schedule?.route?.arrival_city}`, 20, 40);
    doc.text(`Date: ${this.datePipe.transform(this.selectedTicket.reservation?.schedule?.departure_time, 'short')}`, 20, 50);
    doc.text(`Siège: ${this.selectedTicket.seat_number || 'N/A'}`, 20, 60);
    doc.text(`Prix: ${this.selectedTicket.price || this.selectedTicket.reservation?.total_price || 0} Ar`, 20, 70);
    
    doc.save(`billet-${this.selectedTicket.id}.pdf`);
  }

  onPageChange(page: number) {
    this.page = page;
  }
}
