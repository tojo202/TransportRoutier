import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../services/vehicle';
import { AgencyService } from '../../services/agency';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './vehicles.html',
  styleUrls: ['./vehicles.css']
})
export class VehiclesComponent implements OnInit {
  p: number = 1;
  vehicles: any[] = [];
  filteredVehicles: any[] = [];
  agencies: any[] = [];
  searchTerm = '';

  showFormModal = false;
  editingId: number | null = null;
  form: any = { plate_number: '', brand: '', model: '', capacity: 4, status: 'available', agency_id: '' };

  constructor(private vehicleService: VehicleService, private agencyService: AgencyService) {}

  ngOnInit(): void {
    this.loadVehicles();
    this.loadAgencies();
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.filteredVehicles = []; // Hide until search
      },
      error: (err) => console.error(err)
    });
  }

  loadAgencies(): void {
    this.agencyService.getAgencies().subscribe(data => this.agencies = data);
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    if (term.trim() === '') {
      this.filteredVehicles = [];
      return;
    }
    this.filteredVehicles = this.vehicles.filter(v => 
      (v.plate_number && v.plate_number.toLowerCase().includes(term)) || 
      (v.brand && v.brand.toLowerCase().includes(term)) ||
      (v.model && v.model.toLowerCase().includes(term))
    );
  }

  openForm(vehicle?: any): void {
    if (vehicle) {
      this.editingId = vehicle.id;
      this.form = { ...vehicle };
    } else {
      this.editingId = null;
      this.form = { plate_number: '', brand: '', model: '', capacity: 4, status: 'available', agency_id: '' };
    }
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  saveVehicle(): void {
    if (this.editingId) {
      this.vehicleService.updateVehicle(this.editingId, this.form).subscribe(() => {
        this.loadVehicles();
        this.closeForm();
        Swal.fire('Succès', 'Véhicule modifié', 'success');
      });
    } else {
      this.vehicleService.createVehicle(this.form).subscribe(() => {
        this.loadVehicles();
        this.closeForm();
        Swal.fire('Succès', 'Véhicule ajouté', 'success');
      });
    }
  }

  deleteVehicle(id: number): void {
    Swal.fire({
      title: 'Supprimer ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehicleService.deleteVehicle(id).subscribe(() => {
          this.loadVehicles();
          Swal.fire('Supprimé!', '', 'success');
        });
      }
    });
  }
}
