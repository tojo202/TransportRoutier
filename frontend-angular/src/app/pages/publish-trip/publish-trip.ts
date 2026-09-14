import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ScheduleService } from '../../services/schedule';
import { VehicleService } from '../../services/vehicle';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-publish-trip',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './publish-trip.html',
  styleUrl: './publish-trip.css'
})
export class PublishTripComponent implements OnInit {
  origin: string = '';
  destination: string = '';
  departureDate: string = '';
  departureTime: string = '08:00';
  estimatedDuration: number = 3;
  vehicleId: number = 1;
  price: number = 5000;
  availableSeats: number = 19;
  
  vehicles: any[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;

  cities: string[] = ['Dakar', 'Saint-Louis', 'Thiès', 'Touba', 'Kaolack', 'Ziguinchor', 'Mbour', 'Tambacounda'];

  constructor(
    private scheduleService: ScheduleService,
    private vehicleService: VehicleService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.departureDate = today.toISOString().split('T')[0];

    this.loadVehicles();
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        if (data.length > 0) {
          this.vehicleId = data[0].id || 1;
          this.availableSeats = data[0].capacity;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onVehicleChange(): void {
    const v = this.vehicles.find(item => item.id == this.vehicleId);
    if (v) {
      this.availableSeats = v.capacity;
    }
  }

  onSubmit(): void {
    if (!this.origin || !this.destination || !this.departureDate || !this.price) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSaving = true;
    const departureDateTime = `${this.departureDate} ${this.departureTime}:00`;
    
    // Compute arrival time
    const dep = new Date(departureDateTime);
    dep.setHours(dep.getHours() + this.estimatedDuration);
    const arrivalDateTime = dep.toISOString().slice(0, 19).replace('T', ' ');

    const payload = {
      origin: this.origin,
      destination: this.destination,
      departure_time: departureDateTime,
      arrival_time: arrivalDateTime,
      vehicle_id: this.vehicleId,
      price: this.price,
      available_seats: this.availableSeats,
      status: 'scheduled'
    };

    this.scheduleService.createSchedule(payload).subscribe({
      next: () => {
        this.isSaving = false;
        alert('🎉 Trajet publié avec succès !');
        if (this.authService.isDriver()) {
          this.router.navigate(['/driver-trips']);
        } else {
          this.router.navigate(['/schedules']);
        }
      },
      error: (err) => {
        this.isSaving = false;
        alert(err.error?.message || 'Erreur lors de la publication du trajet');
      }
    });
  }
}
