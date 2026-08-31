import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ScheduleService } from '../../services/schedule';
import { RouteService } from '../../services/route';
import { VehicleService } from '../../services/vehicle';
import { DriverService } from '../../services/driver';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatInputModule, FormsModule, NgxPaginationModule],
  providers: [DatePipe],
  templateUrl: './schedules.html',
  styleUrls: ['./schedules.css']
})
export class SchedulesComponent implements OnInit {
  p: number = 1;
  schedules: any[] = [];
  filteredSchedules: any[] = [];
  routes: any[] = [];
  vehicles: any[] = [];
  drivers: any[] = [];
  searchTerm = '';

  showFormModal = false;
  editingId: number | null = null;
  form: any = { route_id: '', vehicle_id: '', driver_id: '', departure_time: '', arrival_time: '', status: 'scheduled' };

  constructor(
    private scheduleService: ScheduleService,
    private routeService: RouteService,
    private vehicleService: VehicleService,
    private driverService: DriverService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.scheduleService.getSchedules().subscribe(data => {
      this.schedules = data;
      this.filteredSchedules = data;
    });
    this.routeService.getRoutes().subscribe(data => this.routes = data);
    this.vehicleService.getVehicles().subscribe(data => this.vehicles = data);
    this.driverService.getDrivers().subscribe(data => this.drivers = data);
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredSchedules = this.schedules.filter(s => {
      const dep = (s.route?.origin || s.route?.departure_city || '').toLowerCase();
      const arr = (s.route?.destination || s.route?.arrival_city || '').toLowerCase();
      const drv = (s.driver?.name || (s.driver?.first_name ? s.driver.first_name + ' ' + s.driver.last_name : '')).toLowerCase();
      return dep.includes(term) || arr.includes(term) || drv.includes(term);
    });
  }

  openForm(schedule?: any): void {
    if (schedule) {
      this.editingId = schedule.id;
      // Convert datetime for input type datetime-local
      this.form = { ...schedule };
      if (this.form.departure_time) this.form.departure_time = this.form.departure_time.slice(0, 16);
      if (this.form.arrival_time) this.form.arrival_time = this.form.arrival_time.slice(0, 16);
    } else {
      this.editingId = null;
      this.form = { route_id: '', vehicle_id: '', driver_id: '', departure_time: '', arrival_time: '', status: 'scheduled' };
    }
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  saveSchedule(): void {
    if (this.editingId) {
      this.scheduleService.updateSchedule(this.editingId, this.form).subscribe(() => {
        this.loadData();
        this.closeForm();
        Swal.fire('Succès', 'Planning modifié', 'success');
      });
    } else {
      this.scheduleService.createSchedule(this.form).subscribe(() => {
        this.loadData();
        this.closeForm();
        Swal.fire('Succès', 'Planning ajouté', 'success');
      });
    }
  }

  deleteSchedule(id: number): void {
    Swal.fire({
      title: 'Supprimer ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.scheduleService.deleteSchedule(id).subscribe(() => {
          this.loadData();
          Swal.fire('Supprimé!', '', 'success');
        });
      }
    });
  }
}
