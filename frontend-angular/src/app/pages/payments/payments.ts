import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaymentService } from '../../services/payment';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatInputModule, FormsModule, NgxPaginationModule],
  providers: [DatePipe],
  templateUrl: './payments.html',
  styleUrls: ['./payments.css']
})
export class PaymentsComponent implements OnInit {
  p: number = 1;
  payments: any[] = [];
  filteredPayments: any[] = [];
  searchTerm = '';

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.paymentService.getPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.filteredPayments = data;
      },
      error: (err) => console.error(err)
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredPayments = this.payments.filter(p => {
      const client = (p.reservation?.user?.name || '').toLowerCase();
      const ref = (p.transaction_reference || p.transaction_id || '').toLowerCase();
      const method = (p.payment_method || '').toLowerCase();
      return client.includes(term) || ref.includes(term) || method.includes(term);
    });
  }

  deletePayment(id: number): void {
    Swal.fire({
      title: 'Supprimer ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.paymentService.deletePayment(id).subscribe(() => {
          this.loadPayments();
          Swal.fire('Supprimé!', '', 'success');
        });
      }
    });
  }
}
