import { NgxPaginationModule } from 'ngx-pagination';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgencyService, Agency, PaginatedResponse } from '../../services/agency';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-agencies',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './agencies.html',
  styleUrls: ['./agencies.css']
})
export class AgenciesComponent implements OnInit, OnDestroy {
  p: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  
  agencies: Agency[] = [];
  filteredAgencies: Agency[] = [];
  searchTerm = '';
  
  isLoading = false;
  hasError = false;
  errorMessage = '';

  showFormModal = false;
  editingId: number | null = null;
  form = { name: '', address: '', phone: '', manager_name: '' };

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private agencyService: AgencyService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
      this.p = 1;
      this.loadAgencies();
    });

    this.loadAgencies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  applyFilter(): void {
    this.onSearchChange(this.searchTerm);
  }

  loadAgencies(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.agencyService.getAgencies({
      search: this.searchTerm,
      page: this.p,
      per_page: this.pageSize
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (Array.isArray(res)) {
          this.agencies = res;
          this.applyFilterLocally();
          this.totalItems = this.filteredAgencies.length;
        } else {
          const paginated = res as PaginatedResponse<Agency>;
          this.agencies = paginated.data || [];
          this.filteredAgencies = [...this.agencies];
          this.totalItems = paginated.total || this.agencies.length;
          this.p = paginated.current_page || 1;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Impossible de charger la liste des agences. Veuillez réessayer.';
        this.toastService.error('Erreur', this.errorMessage);
      }
    });
  }

  applyFilterLocally(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredAgencies = [...this.agencies];
      return;
    }
    this.filteredAgencies = this.agencies.filter(a => 
      (a.name && a.name.toLowerCase().includes(term)) || 
      (a.address && a.address.toLowerCase().includes(term)) ||
      (a.manager_name && a.manager_name.toLowerCase().includes(term))
    );
  }

  retryLoad(): void {
    this.loadAgencies();
  }

  openForm(agency?: Agency): void {
    if (agency) {
      this.editingId = agency.id || null;
      this.form = {
        name: agency.name || '',
        address: agency.address || '',
        phone: agency.phone || '',
        manager_name: agency.manager_name || ''
      };
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
    if (!this.form.name || !this.form.phone) {
      this.toastService.warning('Champs requis', 'Veuillez renseigner au moins le nom et le téléphone.');
      return;
    }

    if (this.editingId) {
      this.agencyService.updateAgency(this.editingId, this.form).subscribe({
        next: () => {
          this.loadAgencies();
          this.closeForm();
          this.toastService.success('Succès', 'L\'agence a été modifiée avec succès.');
        },
        error: () => {
          this.toastService.error('Erreur', 'Impossible de modifier l\'agence.');
        }
      });
    } else {
      this.agencyService.createAgency(this.form).subscribe({
        next: () => {
          this.loadAgencies();
          this.closeForm();
          this.toastService.success('Succès', 'Nouvelle agence ajoutée avec succès.');
        },
        error: () => {
          this.toastService.error('Erreur', 'Impossible de créer l\'agence.');
        }
      });
    }
  }

  deleteAgency(id: number): void {
    Swal.fire({
      title: 'Supprimer l\'agence ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#5B8A6B'
    }).then((result) => {
      if (result.isConfirmed) {
        this.agencyService.deleteAgency(id).subscribe({
          next: () => {
            this.loadAgencies();
            this.toastService.success('Supprimé', 'L\'agence a été supprimée.');
          },
          error: () => {
            this.toastService.error('Erreur', 'Impossible de supprimer cette agence.');
          }
        });
      }
    });
  }
}
