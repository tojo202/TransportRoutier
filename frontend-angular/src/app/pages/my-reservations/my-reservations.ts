import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReservationService, Reservation } from '../../services/reservation';
import { AuthService } from '../../services/auth';
import { QrCodeService } from '../../services/qrcode.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.css'
})
export class MyReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  isLoading: boolean = false;
  selectedTicketReservation: any = null;
  qrCodeDataUrl: string = '';
  showTicketModal: boolean = false;

  constructor(
    private reservationService: ReservationService,
    public authService: AuthService,
    private qrCodeService: QrCodeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();
    const filters: any = {};
    if (user && user.role === 'client') {
      filters.user_id = user.id;
    }

    this.reservationService.getReservations(filters).subscribe({
      next: (data) => {
        this.reservations = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reservations', err);
        this.isLoading = false;
      }
    });
  }

  async viewTicket(res: Reservation): Promise<void> {
    this.selectedTicketReservation = res;
    const qrPayload = res.ticket?.qr_code || `TICKET-${res.ticket?.ticket_number || res.id}`;
    this.qrCodeDataUrl = await this.qrCodeService.generateDataUrl(qrPayload);
    this.showTicketModal = true;
  }

  closeTicketModal(): void {
    this.showTicketModal = false;
    this.selectedTicketReservation = null;
  }

  printTicket(): void {
    window.print();
  }

  openChat(scheduleId: number): void {
    this.router.navigate(['/chat'], { queryParams: { schedule_id: scheduleId } });
  }

  openReview(driverId: number, scheduleId: number): void {
    this.router.navigate(['/reviews'], { queryParams: { driver_id: driverId, schedule_id: scheduleId } });
  }

  cancelReservation(res: Reservation): void {
    if (!res.id) return;
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.reservationService.deleteReservation(res.id).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (err) => alert(err.error?.message || 'Erreur lors de l\'annulation')
      });
    }
  }
}
