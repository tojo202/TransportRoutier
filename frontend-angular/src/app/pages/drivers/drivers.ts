import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../services/driver';
import { AgencyService } from '../../services/agency';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './drivers.html',
  styleUrls: ['./drivers.css']
})
export class DriversComponent implements OnInit {
  p: number = 1;
  drivers: any[] = [];
  filteredDrivers: any[] = [];
  agencies: any[] = [];
  searchTerm = '';

  showFormModal = false;
  editingId: number | null = null;
  form: any = { first_name: '', last_name: '', license_number: '', phone: '', email: '', status: 'active', agency_id: '' };

  constructor(private driverService: DriverService, private agencyService: AgencyService) {}

  ngOnInit(): void {
    this.loadDrivers();
    this.loadAgencies();
  }

  loadDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (data) => {
        this.drivers = data;
        this.filteredDrivers = []; // Do not display until search
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
      this.filteredDrivers = [];
      return;
    }
    this.filteredDrivers = this.drivers.filter(d => {
      const fullname = (d.name || (d.first_name ? d.first_name + ' ' + d.last_name : '')).toLowerCase();
      const lic = (d.license_number || '').toLowerCase();
      return fullname.includes(term) || lic.includes(term);
    });
  }

  openForm(driver?: any): void {
    if (driver) {
      this.editingId = driver.id;
      this.form = {
        name: driver.name || (driver.first_name ? `${driver.first_name} ${driver.last_name}` : ''),
        license_number: driver.license_number || '',
        phone: driver.phone || '',
        experience_years: driver.experience_years || 0,
        agency_id: driver.agency_id || ''
      };
    } else {
      this.editingId = null;
      this.form = { name: '', license_number: '', phone: '', experience_years: 0, agency_id: '' };
    }
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  saveDriver(): void {
    const payload = {
      ...this.form,
      first_name: this.form.name ? this.form.name.split(' ')[0] : '',
      last_name: this.form.name ? this.form.name.split(' ').slice(1).join(' ') : ''
    };

    if (this.editingId) {
      this.driverService.updateDriver(this.editingId, payload).subscribe(() => {
        this.loadDrivers();
        this.closeForm();
        Swal.fire('Succès', 'Chauffeur modifié', 'success');
      });
    } else {
      this.driverService.createDriver(payload).subscribe(() => {
        this.loadDrivers();
        this.closeForm();
        Swal.fire('Succès', 'Chauffeur ajouté', 'success');
      });
    }
  }

  deleteDriver(id: number): void {
    Swal.fire({
      title: 'Supprimer ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.driverService.deleteDriver(id).subscribe(() => {
          this.loadDrivers();
          Swal.fire('Supprimé!', '', 'success');
        });
      }
    });
  }
}
