import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ScheduleService, Schedule } from '../../services/schedule';
import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth';
import { QrCodeService } from '../../services/qrcode.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-platform',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './platform.html',
  styleUrl: './platform.css'
})
export class PlatformComponent implements OnInit {
  // Search parameters
  searchOrigin: string = '';
  searchDestination: string = '';
  searchDate: string = '';
  selectedFilter: string = 'all';

  // Schedule data & pagination (serveur Laravel)
  schedules: Schedule[] = [];
  filteredSchedules: Schedule[] = [];
  paginatedSchedules: Schedule[] = [];
  isLoading: boolean = false;

  currentPage: number = 1;
  pageSize: number = 4;
  totalPages: number = 1;
  totalItems: number = 0;
  pages: number[] = [];

  // Booking Modal
  showBookingModal: boolean = false;
  selectedSchedule: Schedule | null = null;
  bookingStep: number = 1; // 1: Seat selection, 2: Passenger info & payment, 3: Ticket QR confirmation

  // Seat Selection
  selectedSeat: number | null = null;
  vehicleCapacity: number = 19;
  occupiedSeats: number[] = [];
  seatRows: any[] = [];

  // Passenger & Payment Info
  passengerName: string = '';
  passengerPhone: string = '';
  passengerEmail: string = '';
  paymentMethod: string = 'wave';
  paymentPhone: string = '';
  isProcessingPayment: boolean = false;
  paymentSuccess: boolean = false;

  // Generated Ticket Result
  confirmedReservation: any = null;
  qrCodeUrl: string = '';

  // Connexion contextuelle (invités)
  authMode: 'create' | 'login' = 'create';
  loginEmail: string = '';
  loginPassword: string = '';
  isAuthProcessing: boolean = false;
  authError: string = '';

  cities: string[] = ['Dakar', 'Saint-Louis', 'Thiès', 'Touba', 'Kaolack', 'Ziguinchor', 'Mbour'];

  constructor(
    private scheduleService: ScheduleService,
    private reservationService: ReservationService,
    public authService: AuthService,
    private qrCodeService: QrCodeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.passengerName = user.name;
      this.passengerEmail = user.email;
    }
    this.loadSchedules();
  }

  get isGuest(): boolean {
    return !this.authService.getCurrentUser();
  }

  loadSchedules(): void {
    this.isLoading = true;
    const filters: any = {
      page: this.currentPage,
      per_page: this.pageSize
    };

    if (this.searchOrigin) filters.origin = this.searchOrigin;
    if (this.searchDestination) filters.destination = this.searchDestination;
    if (this.searchDate) filters.date = this.searchDate;
    if (this.selectedFilter === 'cheap') filters.max_price = 5000;
    if (this.selectedFilter === 'vip') filters.min_price = 7000;
    if (this.selectedFilter === 'today') {
      filters.date = new Date().toISOString().split('T')[0];
    }

    this.scheduleService.getSchedules(filters).subscribe({
      next: (data: any) => {
        this.schedules = Array.isArray(data) ? data : (data.data || []);
        this.totalItems = data.total ?? this.schedules.length;
        this.totalPages = data.last_page || 1;
        this.currentPage = data.current_page || 1;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading schedules', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadSchedules();
  }

  resetSearch(): void {
    this.searchOrigin = '';
    this.searchDestination = '';
    this.searchDate = '';
    this.selectedFilter = 'all';
    this.currentPage = 1;
    this.loadSchedules();
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.currentPage = 1;
    this.loadSchedules();
  }

  applyFilter(): void {
    // La pagination et les filtres sont gérés côté serveur (Laravel paginate).
    this.filteredSchedules = [...this.schedules];
    this.updatePaginatedList();
  }

  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedSchedules = this.filteredSchedules.slice(startIndex, endIndex);
    if (this.paginatedSchedules.length === 0 && this.currentPage > 1) {
      this.currentPage = 1;
      this.updatePaginatedList();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadSchedules();
    }
  }

  // --- Booking Flow ---
  startBooking(schedule: Schedule): void {
    this.selectedSchedule = schedule;
    this.vehicleCapacity = schedule.vehicle?.capacity || 19;
    this.occupiedSeats = schedule.occupied_seats || [];
    this.selectedSeat = null;
    this.bookingStep = 1;
    this.paymentSuccess = false;
    this.authError = '';
    this.generateSeatLayout();
    this.showBookingModal = true;
  }

  closeBooking(): void {
    this.showBookingModal = false;
    this.selectedSchedule = null;
    this.bookingStep = 1;
  }

  generateSeatLayout(): void {
    const total = this.vehicleCapacity;
    this.seatRows = [];

    // Create standard 4-across rows (2 seats - aisle - 2 seats)
    let currentSeat = 1;
    while (currentSeat <= total) {
      const row = [];
      for (let i = 0; i < 4 && currentSeat <= total; i++) {
        if (i === 2) {
          row.push({ isAisle: true });
        }
        row.push({
          seatNumber: currentSeat,
          isOccupied: this.occupiedSeats.includes(currentSeat),
          isAisle: false
        });
        currentSeat++;
      }
      this.seatRows.push(row);
    }
  }

  selectSeat(seatNum: number): void {
    if (!this.occupiedSeats.includes(seatNum)) {
      this.selectedSeat = seatNum;
    }
  }

  proceedToPassengerInfo(): void {
    if (!this.selectedSeat) return;
    this.bookingStep = 2;
  }

  // Connexion / création de compte contextuelle
  doAuth(action: 'login' | 'register'): void {
    this.isAuthProcessing = true;
    this.authError = '';

    const call = action === 'login'
      ? this.authService.login({ email: this.loginEmail, password: this.loginPassword })
      : this.authService.register({
          name: this.passengerName,
          email: this.passengerEmail || this.loginEmail,
          password: (this.loginPassword || 'client$' + Date.now()).slice(0, 16) || 'client123',
          role: 'client'
        });

    call.subscribe({
      next: () => {
        this.isAuthProcessing = false;
        const user = this.authService.getCurrentUser();
        if (user) this.passengerName = user.name;
      },
      error: (err) => {
        this.isAuthProcessing = false;
        this.authError = err.error?.message || err.error?.email?.[0] || 'Erreur de connexion. Vérifiez vos identifiants.';
      }
    });
  }

  submitPaymentAndBooking(): void {
    if (!this.selectedSchedule || !this.selectedSeat) return;

    this.isProcessingPayment = true;

    const payload = {
      schedule_id: this.selectedSchedule.id,
      seat_number: this.selectedSeat,
      total_amount: this.selectedSchedule.price,
      payment_method: this.paymentMethod,
      passenger_name: this.passengerName || 'Client Passager',
      passenger_phone: this.passengerPhone,
      passenger_email: this.passengerEmail
    };

    this.reservationService.createReservation(payload).subscribe({
      next: async (res: any) => {
        this.isProcessingPayment = false;
        this.paymentSuccess = true;
        this.confirmedReservation = res;
        this.bookingStep = 3;

        // Compte créé contextuellement → connexion automatique
        if (res.account_created && res.auth_token) {
          this.authService.setToken(res.auth_token);
          this.authService.setUser(res.user);
        }

        const qrContent = res.ticket?.qr_code || `TICKET-${res.ticket?.ticket_number || res.id}`;
        this.qrCodeUrl = await this.qrCodeService.generateDataUrl(qrContent);

        // Refresh schedules
        this.loadSchedules();
      },
      error: (err) => {
        this.isProcessingPayment = false;
        alert(err.error?.error || 'Une erreur est survenue lors de la réservation.');
      }
    });
  }

  printTicket(): void {
    window.print();
  }

  goToMyReservations(): void {
    this.closeBooking();
    this.router.navigate(['/my-reservations']);
  }
}