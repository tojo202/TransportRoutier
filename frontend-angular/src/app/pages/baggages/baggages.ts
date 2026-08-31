import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BaggageService } from '../../services/baggage';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { VerticalPaginationComponent } from '../../components/vertical-pagination/vertical-pagination';

@Component({
  selector: 'app-baggages',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule
    , VerticalPaginationComponent
  , NgxPaginationModule],
  providers: [DatePipe],
  templateUrl: './baggages.html',
  styleUrls: ['./baggages.css']
})
export class BaggagesComponent implements OnInit {
  p: number = 1;
  baggages: any[] = [];
  filteredBaggages: any[] = [];
  searchTerm = '';

  showFormModal = false;
  editingId: number | null = null;
  form = {
    ticket_id: '',
    weight: '',
    type: 'suitcase',
    description: '',
    status: 'registered'
  };
  
  showLabelModal = false;
  selectedBaggage: any = null;
  qrCodeUrl = '';
  // Pagination
  page = 1;
  perPage = 10;
  totalPages = 1;

  constructor(private baggageService: BaggageService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.loadBaggages();
  }

  loadBaggages(): void {
    this.baggageService.getBaggages().subscribe({
      next: (data) => {
        this.baggages = data;
        this.filteredBaggages = data;
        this.totalPages = Math.max(1, Math.ceil(this.filteredBaggages.length / this.perPage));
      },
      error: (err) => console.error(err)
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredBaggages = this.baggages.filter(b => {
      const passenger = (b.reservation?.user?.name || b.ticket?.reservation?.user?.name || '').toLowerCase();
      const tag = (b.tag_number || '').toLowerCase();
      const id = b.id ? b.id.toString() : '';
      return id.includes(term) || passenger.includes(term) || tag.includes(term);
    });
  }

  openForm(baggage?: any): void {
    if (baggage) {
      this.editingId = baggage.id;
      this.form = {
        ticket_id: baggage.reservation_id || baggage.ticket_id || '',
        weight: baggage.weight_kg || baggage.weight || '',
        type: baggage.type || 'suitcase',
        description: baggage.tag_number || baggage.description || '',
        status: baggage.status || 'registered'
      };
    } else {
      this.editingId = null;
      this.form = { ticket_id: '', weight: '', type: 'suitcase', description: '', status: 'registered' };
    }
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  saveBaggage(): void {
    const payload = {
      reservation_id: this.form.ticket_id,
      weight_kg: this.form.weight,
      tag_number: this.form.description || `BAG-${Date.now().toString().slice(-4)}`,
      status: this.form.status
    };

    if (this.editingId) {
      this.baggageService.updateBaggage(this.editingId, payload).subscribe(() => {
        this.loadBaggages();
        this.closeForm();
        Swal.fire('Succès', 'Bagage modifié avec succès', 'success');
      });
    } else {
      this.baggageService.createBaggage(payload).subscribe(() => {
        this.loadBaggages();
        this.closeForm();
        Swal.fire('Succès', 'Bagage enregistré avec succès', 'success');
      });
    }
  }

  deleteBaggage(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "La suppression est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.baggageService.deleteBaggage(id).subscribe(() => {
          this.loadBaggages();
          Swal.fire('Supprimé!', 'Le bagage a été supprimé.', 'success');
        });
      }
    });
  }

  printLabel(baggage: any): void {
    this.selectedBaggage = baggage;
    const data = `BAG-${baggage.id}-${baggage.ticket_id}`;
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(data)}`;
    this.showLabelModal = true;
  }

  closeLabel(): void {
    this.showLabelModal = false;
    this.selectedBaggage = null;
  }

  doPrint(): void {
    window.print();
  }

  onPageChange(page: number) { this.page = page; }
}
