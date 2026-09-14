import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReviewService, Review } from '../../services/review';
import { DriverService } from '../../services/driver';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css'
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  drivers: any[] = [];
  selectedDriverId: number | null = null;
  scheduleId?: number;
  
  // New Review Form
  newRating: number = 5;
  newComment: string = '';
  hoverRating: number = 0;
  isSubmitting: boolean = false;
  showReviewModal: boolean = false;
  isLoading: boolean = false;

  driverStats: any = null;

  constructor(
    private reviewService: ReviewService,
    private driverService: DriverService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadDrivers();
    this.route.queryParams.subscribe(params => {
      if (params['driver_id']) {
        this.selectedDriverId = +params['driver_id'];
        this.showReviewModal = true;
      }
      if (params['schedule_id']) {
        this.scheduleId = +params['schedule_id'];
      }
      this.loadReviews();
    });
  }

  loadDrivers(): void {
    this.driverService.getDrivers().subscribe(data => {
      this.drivers = data;
    });
  }

  loadReviews(): void {
    this.isLoading = true;
    this.reviewService.getReviews(this.selectedDriverId || undefined).subscribe({
      next: (data) => {
        this.reviews = Array.isArray(data) ? data : (data.data || []);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });

    if (this.selectedDriverId) {
      this.reviewService.getDriverStats(this.selectedDriverId).subscribe({
        next: (stats) => this.driverStats = stats
      });
    }
  }

  onDriverFilterChange(): void {
    this.loadReviews();
  }

  setRating(r: number): void {
    this.newRating = r;
  }

  openReviewModal(driverId?: number): void {
    if (driverId) this.selectedDriverId = driverId;
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  submitReview(): void {
    if (!this.selectedDriverId) {
      alert('Veuillez sélectionner un conducteur.');
      return;
    }

    this.isSubmitting = true;
    const reviewData: Review = {
      driver_id: this.selectedDriverId,
      schedule_id: this.scheduleId,
      rating: this.newRating,
      comment: this.newComment
    };

    this.reviewService.createReview(reviewData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.newComment = '';
        this.showReviewModal = false;
        alert('⭐ Merci ! Votre avis a été publié avec succès.');
        this.loadReviews();
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err.error?.message || 'Erreur lors de l\'enregistrement de votre avis');
      }
    });
  }
}
