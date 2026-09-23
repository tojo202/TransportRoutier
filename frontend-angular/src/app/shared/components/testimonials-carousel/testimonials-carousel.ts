import { Component, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TestimonialData {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  content: string;
  date: string;
  route: string;
}

@Component({
  selector: 'app-testimonials-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="testimonials-carousel-container">
      <div class="testimonial-slides-wrapper">
        <div class="testimonial-slides">
          <div
            class="testimonial-card"
            *ngFor="let testimonial of testimonials; let i = index"
            [class.active]="i === currentIndex"
          >
            <div class="testimonial-card-inner">
              <div class="testimonial-stars">
                <span *ngFor="let s of getStars(testimonial.rating)" class="material-icons star-icon">star</span>
              </div>

              <div class="testimonial-content">
                <p class="testimonial-text">
                  "{{ testimonial.content }}"
                </p>
              </div>

              <div class="testimonial-author">
                <img
                  [src]="testimonial.avatar"
                  [alt]="testimonial.name"
                  class="testimonial-avatar"
                  (error)="onAvatarError($event)"
                />
                <div class="testimonial-author-info">
                  <span class="testimonial-name">{{ testimonial.name }}</span>
                  <span class="testimonial-route">{{ testimonial.route }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="testimonial-controls">
        <button class="testimonial-nav-btn" (click)="prev()">
          <span class="material-icons">arrow_back</span>
        </button>

        <div class="testimonial-pagination">
          <span
            *ngFor="let t of testimonials; let i = index"
            class="dot"
            [class.active]="i === currentIndex"
            (click)="goTo(i)"
          ></span>
        </div>

        <button class="testimonial-nav-btn" (click)="next()">
          <span class="material-icons">arrow_forward</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .testimonials-carousel-container {
      position: relative;
      max-width: 800px;
      margin: 0 auto;
    }

    .testimonial-slides-wrapper {
      overflow: hidden;
      border-radius: var(--radius-lg);
    }

    .testimonial-slides {
      position: relative;
      min-height: 260px;
    }

    .testimonial-card {
      position: absolute;
      inset: 0;
      opacity: 0;
      transform: scale(0.95);
      transition: opacity 0.5s ease, transform 0.5s ease;
      pointer-events: none;
    }

    .testimonial-card.active {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }

    .testimonial-card-inner {
      background: var(--card-bg);
      border-radius: var(--radius-lg);
      border: 2px solid var(--border-color);
      box-shadow: var(--shadow-md);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1rem;
    }

    .testimonial-stars {
      display: flex;
      gap: 2px;
    }

    .testimonial-stars .star-icon {
      font-size: 20px;
      color: var(--secondary);
    }

    .testimonial-content {
      flex: 1;
    }

    .testimonial-text {
      font-size: 1.05rem;
      font-style: italic;
      color: var(--text-primary);
      line-height: 1.7;
      margin: 0;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-top: 0.75rem;
      border-top: 2px solid var(--border-color);
      width: 100%;
    }

    .testimonial-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--border-color);
    }

    .testimonial-author-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .testimonial-name {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--text-primary);
    }

    .testimonial-route {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .testimonial-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.25rem;
    }

    .testimonial-nav-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid var(--border-color);
      background: var(--card-bg);
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .testimonial-nav-btn:hover {
      background: var(--primary);
      border-color: var(--primary);
      color: #FFFFFB;
    }

    .testimonial-nav-btn .material-icons {
      font-size: 18px;
    }

    .testimonial-pagination {
      display: flex;
      gap: 0.375rem;
    }

    .testimonial-pagination .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border-strong);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .testimonial-pagination .dot.active {
      width: 24px;
      background: var(--primary);
      border-radius: 4px;
    }
  `]
})
export class TestimonialsCarouselComponent implements OnInit, OnDestroy {
  @Input() testimonials: TestimonialData[] = [];
  @Input() autoplayDelay = 5000;

  currentIndex = 0;
  private autoplayInterval: any = null;

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  getStars(rating: number): number[] {
    return Array.from({ length: Math.max(0, Math.min(5, Math.round(rating))) }, (_, i) => i);
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect fill="#E8F0EB" width="48" height="48" rx="24"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="18" font-family="sans-serif" fill="#5B8A6B">?</text></svg>'
    );
  }

  startAutoplay(): void {
    this.stopAutoplay();
    if (this.testimonials.length <= 1) return;
    this.autoplayInterval = setInterval(() => {
      this.next();
    }, this.autoplayDelay);
  }

  stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.startAutoplay();
  }
}
