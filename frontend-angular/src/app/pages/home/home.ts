import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ScheduleService, Schedule } from '../../services/schedule';
import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth';
import { QrCodeService } from '../../services/qrcode.service';
import { ReviewService } from '../../services/review';
import { ToastService } from '../../shared/services/toast.service';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MoneyPipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  // Recherche
  searchOrigin: string = '';
  searchDestination: string = '';
  searchDate: string = '';
  passengers: number = 1;

  // Résultats & pagination serveur
  schedules: Schedule[] = [];
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  hasSearched: boolean = false;

  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;
  totalItems: number = 0;
  pages: number[] = [];

  // Filtres dynamiques
  priceFilter: string = 'all'; // all | le10000 | le5000 | le2000
  sortBy: string = 'departure'; // departure | price_asc | price_desc

  // Compteur stats dynamiques
  stats = { agencies: 12, vehicles: 45, drivers: 38, cities: 8 };

  // Avis clients (section publique)
  reviews: any[] = [];
  reviewLoading: boolean = false;

  cities: string[] = ['Dakar', 'Saint-Louis', 'Thiès', 'Touba', 'Kaolack', 'Ziguinchor', 'Mbour', 'Tambacounda'];
  popularTrips: { origin: string; destination: string }[] = [
    { origin: 'Dakar', destination: 'Saint-Louis' },
    { origin: 'Dakar', destination: 'Thiès' },
    { origin: 'Dakar', destination: 'Touba' },
    { origin: 'Dakar', destination: 'Ziguinchor' }
  ];

  // Modal réservation
  showBookingModal: boolean = false;
  selectedSchedule: Schedule | null = null;
  bookingStep: number = 1;
  selectedSeat: number | null = null;
  vehicleCapacity: number = 19;
  occupiedSeats: number[] = [];
  seatRows: any[] = [];

  passengerName: string = '';
  passengerPhone: string = '';
  passengerEmail: string = '';
  paymentMethod: string = 'wave';
  paymentPhone: string = '';
  isProcessingPayment: boolean = false;
  paymentSuccess: boolean = false;
  confirmedReservation: any = null;
  qrCodeUrl: string = '';

  // Connexion contextuelle
  authMode: 'create' | 'login' = 'create';
  loginEmail: string = '';
  loginPassword: string = '';
  isAuthProcessing: boolean = false;
  authError: string = '';

  constructor(
    private scheduleService: ScheduleService,
    private reservationService: ReservationService,
    public authService: AuthService,
    private qrCodeService: QrCodeService,
    private reviewService: ReviewService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.passengerName = user.name;
      this.passengerEmail = user.email;
    }
    this.loadSchedules();
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewLoading = true;
    this.reviewService.getReviews(undefined, undefined, 4).subscribe({
      next: (res: any) => {
        this.reviews = Array.isArray(res) ? res : (res.data || []);
        this.reviewLoading = false;
      },
      error: () => {
        this.reviews = [];
        this.reviewLoading = false;
      }
    });
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  applyPopular(origin: string, destination: string): void {
    this.searchOrigin = origin;
    this.searchDestination = destination;
    this.searchDate = '';
    this.passengers = 1;
    this.onSearch();
  }

  loadSchedules(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    const filters: any = {
      page: this.currentPage,
      per_page: this.pageSize,
      seats: this.passengers || 1
    };
    if (this.searchOrigin) filters.origin = this.searchOrigin;
    if (this.searchDestination) filters.destination = this.searchDestination;
    if (this.searchDate) filters.date = this.searchDate;

    if (this.priceFilter === 'le10000') filters.max_price = 10000;
    if (this.priceFilter === 'le5000') filters.max_price = 5000;
    if (this.priceFilter === 'le2000') filters.max_price = 2000;

    this.scheduleService.getSchedules(filters).subscribe({
      next: (data: any) => {
        this.schedules = Array.isArray(data) ? data : (data.data || []);
        this.totalItems = data.total ?? this.schedules.length;
        this.totalPages = data.last_page || Math.ceil(this.totalItems / this.pageSize) || 1;
        this.currentPage = data.current_page || 1;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.isLoading = false;
      },
      error: (err) => {
        this.schedules = [];
        this.totalItems = 0;
        this.totalPages = 1;
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Impossible de charger les trajets. Veuillez vérifier votre connexion.';
        this.toastService.error('Erreur de chargement', this.errorMessage);
      }
    });
  }

  retryLoad(): void {
    this.loadSchedules();
  }

  onSearch(): void {
    this.hasSearched = true;
    this.currentPage = 1;
    this.loadSchedules();
  }

  resetSearch(): void {
    this.searchOrigin = '';
    this.searchDestination = '';
    this.searchDate = '';
    this.passengers = 1;
    this.priceFilter = 'all';
    this.sortBy = 'departure';
    this.hasSearched = false;
    this.currentPage = 1;
    this.loadSchedules();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadSchedules();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadSchedules();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getSortedSchedules(): Schedule[] {
    if (this.sortBy === 'price_asc') return [...this.schedules].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (this.sortBy === 'price_desc') return [...this.schedules].sort((a, b) => (b.price || 0) - (a.price || 0));
    return this.schedules;
  }

  // --- Réservation ---
  startBooking(schedule: Schedule): void {
    this.selectedSchedule = schedule;
    this.vehicleCapacity = schedule.vehicle?.capacity || 19;
    this.occupiedSeats = schedule.occupied_seats || [];
    this.selectedSeat = null;
    this.bookingStep = 1;
    this.paymentSuccess = false;
    this.generateSeatLayout();
    this.showBookingModal = true;
  }

  closeBooking(): void {
    this.showBookingModal = false;
    this.selectedSchedule = null;
    this.bookingStep = 1;
    this.authError = '';
  }

  generateSeatLayout(): void {
    const total = this.vehicleCapacity;
    this.seatRows = [];
    let currentSeat = 1;
    while (currentSeat <= total) {
      const row = [];
      for (let i = 0; i < 4 && currentSeat <= total; i++) {
        if (i === 2) row.push({ isAisle: true });
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

  get isGuest(): boolean {
    return !this.authService.getCurrentUser();
  }

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
        this.toastService.success('Connexion réussie', 'Vous êtes à présent connecté.');
      },
      error: (err) => {
        this.isAuthProcessing = false;
        this.authError = err.error?.message || err.error?.email?.[0] || 'Erreur de connexion. Vérifiez vos identifiants.';
        this.toastService.error('Erreur d\'authentification', this.authError);
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

        if (res.account_created && res.auth_token) {
          this.authService.setToken(res.auth_token);
          this.authService.setUser(res.user);
        }

        const qrContent = res.ticket?.qr_code || `TICKET-${res.ticket?.ticket_number || res.id}`;
        this.qrCodeUrl = await this.qrCodeService.generateDataUrl(qrContent);

        this.toastService.success('Réservation confirmée !', `Billet N° ${res.ticket?.ticket_number || res.id}`);
        this.loadSchedules();
      },
      error: (err) => {
        this.isProcessingPayment = false;
        const msg = err.error?.error || 'Une erreur est survenue lors de la réservation.';
        this.toastService.error('Erreur de réservation', msg);
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

  loginUrl(): string {
    return '/login';
  }

  scrollToSearch(): void {
    document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}