import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from '../../services/route';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatInputModule, FormsModule, NgxPaginationModule],
  templateUrl: './routes.html',
  styleUrls: ['./routes.css']
})
export class RoutesComponent implements OnInit {
  p: number = 1;
  routesList: any[] = [];
  filteredRoutes: any[] = [];
  searchTerm = '';

  showFormModal = false;
  editingId: number | null = null;
  form: any = { departure_city: '', arrival_city: '', distance: 0, estimated_duration: '', default_price: 0 };

  constructor(private routeService: RouteService) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.routeService.getRoutes().subscribe({
      next: (data) => {
        this.routesList = data;
        this.filteredRoutes = data;
      },
      error: (err) => console.error(err)
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredRoutes = this.routesList.filter(r => {
      const dep = (r.origin || r.departure_city || '').toLowerCase();
      const arr = (r.destination || r.arrival_city || '').toLowerCase();
      return dep.includes(term) || arr.includes(term);
    });
  }

  openForm(route?: any): void {
    if (route) {
      this.editingId = route.id;
      this.form = {
        origin: route.origin || route.departure_city || '',
        destination: route.destination || route.arrival_city || '',
        distance_km: route.distance_km || route.distance || 0,
        estimated_duration_hours: route.estimated_duration_hours || route.estimated_duration || 0,
        price: route.price || route.default_price || 0
      };
    } else {
      this.editingId = null;
      this.form = { origin: '', destination: '', distance_km: 0, estimated_duration_hours: 0, price: 0 };
    }
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  saveRoute(): void {
    const payload = {
      ...this.form,
      departure_city: this.form.origin,
      arrival_city: this.form.destination,
      distance: this.form.distance_km,
      estimated_duration: this.form.estimated_duration_hours,
      default_price: this.form.price
    };

    if (this.editingId) {
      this.routeService.updateRoute(this.editingId, payload).subscribe(() => {
        this.loadRoutes();
        this.closeForm();
        Swal.fire('Succès', 'Trajet modifié', 'success');
      });
    } else {
      this.routeService.createRoute(payload).subscribe(() => {
        this.loadRoutes();
        this.closeForm();
        Swal.fire('Succès', 'Trajet ajouté', 'success');
      });
    }
  }

  deleteRoute(id: number): void {
    Swal.fire({
      title: 'Supprimer ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.routeService.deleteRoute(id).subscribe(() => {
          this.loadRoutes();
          Swal.fire('Supprimé!', '', 'success');
        });
      }
    });
  }
}
