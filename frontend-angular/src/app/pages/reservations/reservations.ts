import { NgxPaginationModule } from 'ngx-pagination';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReservationService, Reservation } from '../../services/reservation';
import { ScheduleService } from '../../services/schedule';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { SectionBadgeComponent } from '../../shared/components/section-badge/section-badge.component';
import Swal from 'sweetalert2';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NgxPaginationModule,
    RevealOnScrollDirective,
    SectionBadgeComponent,
    MoneyPipe
  ],
  providers: [DatePipe],
  templateUrl: './reservations.html',
  styleUrls: ['./reservations.css']
})
export class ReservationsComponent implements OnInit {
  p: number = 1;
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  schedules: any[] = [];
  searchTerm = '';
  statusFilter = 'all';

  isLoading = false;
  hasError = false;
  errorMessage = '';

  get totalCount(): number {
    return this.reservations.length;
  }
  get confirmedCount(): number {
    return this.reservations.filter(r => r.status === 'confirmed' || !r.status).length;
  }
  get pendingCount(): number {
    return this.reservations.filter(r => r.status === 'pending').length;
  }
  get totalRevenue(): number {
    return this.reservations.reduce((acc, r) => acc + Number(r.total_amount || 0), 0);
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilter();
  }

  showFormModal = false;
  editingId: number | null = null;
  form: any = { user_id: 1, schedule_id: '', seat_number: 1, total_amount: 0, status: 'pending' };

  constructor(
    private reservationService: ReservationService,
    private scheduleService: ScheduleService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.reservationService.getReservations().subscribe({
      next: (data) => {
        this.reservations = Array.isArray(data) ? data : ((data as any).data || []);
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Impossible de charger les réservations.';
        this.toastService.error('Erreur', this.errorMessage);
      }
    });

    this.scheduleService.getSchedules().subscribe({
      next: (data) => this.schedules = Array.isArray(data) ? data : ((data as any).data || []),
      error: () => {}
    });
  }

  retryLoad(): void {
    this.loadData();
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredReservations = this.reservations.filter(r => {
      const matchesSearch = !term || 
        (r.user?.name && r.user.name.toLowerCase().includes(term)) || 
        (r.status && r.status.toLowerCase().includes(term)) ||
        (r.id && r.id.toString().includes(term));
      
      const matchesStatus = this.statusFilter === 'all' || 
        (this.statusFilter === 'confirmed' && (r.status === 'confirmed' || !r.status)) ||
        (this.statusFilter === 'pending' && r.status === 'pending') ||
        (this.statusFilter === 'cancelled' && r.status === 'cancelled');

      return matchesSearch && matchesStatus;
    });
  }

  openForm(reservation?: Reservation): void {
    if (reservation) {
      this.editingId = reservation.id || null;
      this.form = {
        user_id: reservation.user_id || 1,
        schedule_id: reservation.schedule_id || '',
        seat_number: reservation.seat_number || 1,
        total_amount: reservation.total_amount || 0,
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
      this.reservationService.updateReservation(this.editingId, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeForm();
          this.toastService.success('Succès', 'La réservation a été modifiée avec succès.');
        },
        error: () => {
          this.toastService.error('Erreur', 'Impossible de modifier la réservation.');
        }
      });
    } else {
      this.reservationService.createReservation(payload).subscribe({
        next: () => {
          this.loadData();
          this.closeForm();
          this.toastService.success('Succès', 'La réservation a été ajoutée avec succès.');
        },
        error: () => {
          this.toastService.error('Erreur', 'Impossible de créer la réservation.');
        }
      });
    }
  }

  deleteReservation(id?: number): void {
    if (!id) return;
    Swal.fire({
      title: 'Supprimer la réservation ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#5B8A6B'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservationService.deleteReservation(id).subscribe({
          next: () => {
            this.loadData();
            this.toastService.success('Supprimé', 'La réservation a été supprimée.');
          },
          error: () => {
            this.toastService.error('Erreur', 'Impossible de supprimer cette réservation.');
          }
        });
      }
    });
  }
}
