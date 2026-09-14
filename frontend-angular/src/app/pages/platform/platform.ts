import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ScheduleService, Schedule } from '../../services/schedule';
import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth';
import { QrCodeService } from '../../services/qrcode.service';

@Component({
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

  // Schedule data & pagination
  schedules: Schedule[] = [];
  filteredSchedules: Schedule[] = [];
  paginatedSchedules: Schedule[] = [];
  isLoading: boolean = false;
  
  currentPage: number = 1;
  pageSize: number = 4;
  totalPages: number = 1;
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

  loadSchedules(): void {
    this.isLoading = true;
    this.scheduleService.getSchedules().subscribe({
      next: (data: any) => {
        this.schedules = Array.isArray(data) ? data : (data.data || []);
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
    this.applyFilter();
  }

  resetSearch(): void {
    this.searchOrigin = '';
    this.searchDestination = '';
    this.searchDate = '';
    this.selectedFilter = 'all';
    this.currentPage = 1;
    this.applyFilter();
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    let list = [...this.schedules];

    if (this.searchOrigin) {
      list = list.filter(s => s.route?.origin?.toLowerCase().includes(this.searchOrigin.toLowerCase()));
    }

    if (this.searchDestination) {
      list = list.filter(s => s.route?.destination?.toLowerCase().includes(this.searchDestination.toLowerCase()));
    }

    if (this.searchDate) {
      list = list.filter(s => s.departure_time && s.departure_time.startsWith(this.searchDate));
    }

    if (this.selectedFilter === 'cheap') {
      list = list.filter(s => (s.price || 0) <= 5000);
    } else if (this.selectedFilter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      list = list.filter(s => s.departure_time && s.departure_time.startsWith(todayStr));
    } else if (this.selectedFilter === 'vip') {
      list = list.filter(s => s.vehicle?.brand?.includes('Mercedes') || (s.price || 0) >= 7000);
    }

    this.filteredSchedules = list;
    this.totalPages = Math.ceil(this.filteredSchedules.length / this.pageSize) || 1;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updatePaginatedList();
  }

  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedSchedules = this.filteredSchedules.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedList();
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

        // Generate QR code for the ticket
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
