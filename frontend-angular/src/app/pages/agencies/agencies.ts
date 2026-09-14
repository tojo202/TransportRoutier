import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgencyService } from '../../services/agency';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agencies',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './agencies.html',
  styleUrls: ['./agencies.css']
})
export class AgenciesComponent implements OnInit {
  p: number = 1;
  agencies: any[] = [];
  filteredAgencies: any[] = [];
  searchTerm = '';

  showFormModal = false;
  editingId: number | null = null;
  form = { name: '', address: '', phone: '', manager_name: '' };

  constructor(private agencyService: AgencyService) {}

  ngOnInit(): void {
    this.loadAgencies();
  }

  loadAgencies(): void {
    this.agencyService.getAgencies().subscribe({
      next: (data) => {
        this.agencies = data;
        this.applyFilter();
      },
      error: (err) => console.error(err)
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (term === '') {
      this.filteredAgencies = [...this.agencies];
      return;
    }
    this.filteredAgencies = this.agencies.filter(a => 
      (a.name && a.name.toLowerCase().includes(term)) || 
      (a.address && a.address.toLowerCase().includes(term)) ||
      (a.manager_name && a.manager_name.toLowerCase().includes(term))
    );
  }

  openForm(agency?: any): void {
    if (agency) {
      this.editingId = agency.id;
      this.form = { ...agency };
    } else {
      this.editingId = null;
      this.form = { name: '', address: '', phone: '', manager_name: '' };
    }
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  saveAgency(): void {
    if (this.editingId) {
      this.agencyService.updateAgency(this.editingId, this.form).subscribe(() => {
        this.loadAgencies();
        this.closeForm();
        Swal.fire('Succès', 'Agence modifiée', 'success');
      });
    } else {
      this.agencyService.createAgency(this.form).subscribe(() => {
        this.loadAgencies();
        this.closeForm();
        Swal.fire('Succès', 'Agence ajoutée', 'success');
      });
    }
  }

  deleteAgency(id: number): void {
    Swal.fire({
      title: 'Supprimer ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.agencyService.deleteAgency(id).subscribe(() => {
          this.loadAgencies();
          Swal.fire('Supprimé!', '', 'success');
        });
      }
    });
  }
}
