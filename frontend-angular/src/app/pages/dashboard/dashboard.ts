import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { SectionBadgeComponent } from '../../shared/components/section-badge/section-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatProgressSpinnerModule,
    RevealOnScrollDirective,
    SectionBadgeComponent
  ],
  providers: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})

export class Dashboard implements OnInit, OnDestroy {
  stats: any = null;
  isLoading = true;
  error = '';
  
  selectedFilter: string = 'all';
  customStartDate: string = '';
  customEndDate: string = '';
  private refreshTimer: any;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    // Rafraîchissement automatique en temps réel toutes les 30 secondes
    this.refreshTimer = setInterval(() => {
      this.loadStats(false);
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  loadStats(showSpinner = true): void {
    if (showSpinner) {
      this.isLoading = true;
    }
    this.error = '';
    this.dashboardService.getStats(this.selectedFilter, this.customStartDate, this.customEndDate).subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des statistiques.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onFilterChange(): void {
    if (this.selectedFilter !== 'custom') {
      this.loadStats();
    }
  }

  applyCustomFilter(): void {
    if (this.customStartDate && this.customEndDate) {
      this.loadStats();
    }
  }

  refreshDashboard(): void {
    this.loadStats();
  }

  viewAll(type: string): void {
    this.router.navigate([`/${type}`]);
  }
}
