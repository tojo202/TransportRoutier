import { Component, Input, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TripCardVariant = 'gold' | 'sage' | 'blue' | 'lavender' | 'peach';

export interface TripCardData {
  id: number;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  distance: string;
  price: number;
  available_seats: number;
  agency: string;
  vehicle_brand: string;
  vehicle_model: string;
  variant?: TripCardVariant;
}

@Component({
  selector: 'app-trip-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trip-carousel-container">
      <div class="trip-slides" #slidesContainer>
        <div
          class="trip-card"
          *ngFor="let card of cards; let i = index"
          [style.transform]="getCardTransform(i)"
          [style.opacity]="getCardOpacity(i)"
        >
          <div class="trip-card-inner">
            <div class="trip-card-header">
              <span class="trip-card-badge">{{ card.origin }}</span>
              <span class="trip-card-time">{{ card.departure_time }}</span>
            </div>

            <h4 class="trip-card-title">
              {{ card.destination }}
              <span class="trip-card-duration">{{ card.duration }}</span>
            </h4>

            <div class="trip-card-gradient" [style.background]="getGradient(card.variant)"></div>

            <div class="trip-card-footer">
              <span class="trip-card-seats">
                <span class="material-icons">event_seat</span>
                {{ card.available_seats }} places
              </span>
              <span class="trip-card-price">
                {{ card.price | number }} FCFA
              </span>
            </div>
          </div>
        </div>
      </div>

      <button class="trip-nav-btn trip-nav-prev" (click)="prev()" *ngIf="cards.length > 1">
        <span class="material-icons">arrow_back</span>
      </button>
      <button class="trip-nav-btn trip-nav-next" (click)="next()" *ngIf="cards.length > 1">
        <span class="material-icons">arrow_forward</span>
      </button>

      <div class="trip-pagination" *ngIf="cards.length > 1">
        <span
          *ngFor="let c of cards; let i = index"
          class="dot"
          [class.active]="i === currentIndex"
          (click)="goTo(i)"
        ></span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .trip-carousel-container {
      position: relative;
      overflow: hidden;
      padding: 1rem 0;
    }

    .trip-slides {
      display: flex;
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .trip-card {
      flex: 0 0 100%;
      min-width: 0;
      padding: 0 1rem;
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease;
    }

    .trip-card > div {
      background: var(--card-bg);
      border-radius: var(--radius-lg);
      border: 2px solid var(--border-color);
      box-shadow: var(--shadow-md);
      overflow: hidden;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
    }

    .trip-card:hover > div {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .trip-card-inner {
      padding: 1.25rem;
    }

    .trip-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--border-color);
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .trip-card-badge {
      font-family: var(--font-heading);
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--secondary);
      border: 1px solid var(--secondary-light);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }

    .trip-card-time {
      font-size: var(--fs-sm);
      color: var(--text-muted);
    }

    .trip-card-title {
      font-family: var(--font-heading);
      font-size: var(--fs-lg);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0.5rem 0;
      line-height: 1.3;
    }

    .trip-card-duration {
      font-size: var(--fs-xs);
      color: var(--secondary);
      background: var(--secondary-light);
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      margin-left: 0.25rem;
    }

    .trip-card-gradient {
      height: 40px;
      border-radius: var(--radius-md);
      margin: 0.75rem 0;
    }

    .trip-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 2px solid var(--border-color);
    }

    .trip-card-seats {
      font-size: var(--fs-sm);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .trip-card-seats .material-icons { font-size: 16px; }

    .trip-card-price {
      font-family: var(--font-heading);
      font-size: var(--fs-md);
      font-weight: 700;
      color: var(--primary);
    }

    .trip-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--card-bg);
      border: 2px solid var(--border-color);
      color: var(--text-primary);
      cursor: pointer;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .trip-nav-btn:hover {
      background: var(--primary);
      border-color: var(--primary);
      color: #FFFFFB;
    }

    .trip-nav-btn .material-icons { font-size: 20px; }
    .trip-nav-next { right: 0; }
    .trip-nav-prev { left: 0; }

    .trip-pagination {
      display: flex;
      justify-content: center;
      gap: 0.375rem;
      margin-top: 1rem;
    }

    .trip-pagination .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border-strong);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .trip-pagination .dot.active {
      width: 24px;
      background: var(--primary);
      border-radius: 4px;
    }

    @media (max-width: 639px) {
      .trip-nav-btn { width: 32px; height: 32px; }
    }
  `]
})
export class TripCarouselComponent implements AfterViewInit, OnDestroy {
  @Input() cards: TripCardData[] = [];
  @Input() autoplayDelay = 4000;
  @Input() visibleCount = 1;

  @ViewChild('slidesContainer', { static: false }) slidesContainer!: ElementRef;

  currentIndex = 0;
  private autoplayInterval: any = null;

  ngAfterViewInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  getCardTransform(index: number): string {
    const offset = index - this.currentIndex;
    return `translateX(${offset * 105}%)`;
  }

  getCardOpacity(index: number): string {
    return index === this.currentIndex ? '1' : '0.4';
  }

  startAutoplay(): void {
    this.stopAutoplay();
    if (this.cards.length <= 1) return;
    this.autoplayInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    }, this.autoplayDelay);
  }

  stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.startAutoplay();
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.startAutoplay();
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.startAutoplay();
  }

  getGradient(variant: TripCardVariant | undefined): string {
    const gradients: Record<string, string> = {
      gold: 'linear-gradient(135deg, #FFDBAA 0%, #F7D9AA 100%)',
      sage: 'linear-gradient(135deg, #E8F0EB 0%, #D8E4D0 100%)',
      blue: 'linear-gradient(135deg, #EAF2F8 0%, #D6E9F0 100%)',
      lavender: 'linear-gradient(135deg, #F4EDF5 0%, #E4D5F1 100%)',
      peach: 'linear-gradient(135deg, #FFF8F5 0%, #FDE3DD 100%)',
    };
    return gradients[variant || 'sage'];
  }
}
