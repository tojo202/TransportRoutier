import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ScheduleService, Schedule } from '../../services/schedule';
import { AuthService } from '../../services/auth';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-driver-trips',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './driver-trips.html',
  styleUrl: './driver-trips.css'
})
export class DriverTripsComponent implements OnInit {
  trips: Schedule[] = [];
  isLoading: boolean = false;
  selectedTrip: Schedule | null = null;
  showPassengersModal: boolean = false;

  constructor(
    private scheduleService: ScheduleService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();
    const driverId = user?.driver?.id;
    const filters: any = { include_past: 1 };
    if (driverId) {
      filters.driver_id = driverId;
    }

    this.scheduleService.getSchedules(filters).subscribe({
      next: (data: any) => {
        this.trips = Array.isArray(data) ? data : (data.data || []);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading driver trips', err);
        this.isLoading = false;
      }
    });
  }

  viewPassengers(trip: Schedule): void {
    this.selectedTrip = trip;
    this.showPassengersModal = true;
  }

  closePassengersModal(): void {
    this.showPassengersModal = false;
    this.selectedTrip = null;
  }

  goToScan(tripId?: number): void {
    this.router.navigate(['/driver-scan'], { queryParams: { schedule_id: tripId } });
  }

  goToChat(tripId?: number): void {
    this.router.navigate(['/chat'], { queryParams: { schedule_id: tripId } });
  }

  updateTripStatus(trip: Schedule, newStatus: string): void {
    if (!trip.id) return;
    this.scheduleService.updateSchedule(trip.id, { status: newStatus }).subscribe({
      next: () => {
        trip.status = newStatus;
      },
      error: (err) => alert('Erreur lors de la mise à jour du statut')
    });
  }
}
