import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReservationService } from '../../services/reservation';
import { ScheduleService } from '../../services/schedule';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatInputModule, FormsModule, NgxPaginationModule],
  providers: [DatePipe],
  templateUrl: './reservations.html',
  styleUrls: ['./reservations.css']
})
export class ReservationsComponent implements OnInit {
  p: number = 1;
  reservations: any[] = [];
  filteredReservations: any[] = [];
  schedules: any[] = [];
  searchTerm = '';

  showFormModal = false;
  editingId: number | null = null;
  form: any = { user_id: 1, schedule_id: '', seats: 1, total_price: 0, status: 'pending' };

  constructor(
    private reservationService: ReservationService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.reservationService.getReservations().subscribe(data => {
      this.reservations = data;
      this.filteredReservations = data;
    });
    this.scheduleService.getSchedules().subscribe(data => this.schedules = data);
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredReservations = this.reservations.filter(r => 
      r.user?.name.toLowerCase().includes(term) || r.status.toLowerCase().includes(term)
    );
  }

  openForm(reservation?: any): void {
    if (reservation) {
      this.editingId = reservation.id;
      this.form = {
        user_id: reservation.user_id || 1,
        schedule_id: reservation.schedule_id || '',
        seat_number: reservation.seat_number || reservation.seats || 1,
        total_amount: reservation.total_amount || reservation.total_price || 0,
        status: reservation.status || 'pending'
      };
    } else {
      this.editingId = null;
      this.form = { user_id: 1, schedule_id: '', seat_number: 1, total_amount: 0, status: 'pending' };
    }
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  saveReservation(): void {
    const payload = {
      ...this.form,
      seats: this.form.seat_number,
      total_price: this.form.total_amount
    };

    if (this.editingId) {
      this.reservationService.updateReservation(this.editingId, payload).subscribe(() => {
        this.loadData();
        this.closeForm();
        Swal.fire('Succès', 'Réservation modifiée', 'success');
      });
    } else {
      this.reservationService.createReservation(payload).subscribe(() => {
        this.loadData();
        this.closeForm();
        Swal.fire('Succès', 'Réservation ajoutée', 'success');
      });
    }
  }

  deleteReservation(id: number): void {
    Swal.fire({
      title: 'Supprimer ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservationService.deleteReservation(id).subscribe(() => {
          this.loadData();
          Swal.fire('Supprimé!', '', 'success');
        });
      }
    });
  }
}
