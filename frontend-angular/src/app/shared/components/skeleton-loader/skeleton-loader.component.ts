import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type SkeletonVariant = 'text' | 'card' | 'table-row' | 'stat-card' | 'list-item' | 'avatar' | 'button' | 'chart';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container [ngSwitch]="variant">
      <!-- Text skeleton -->
      <div *ngSwitchCase="'text'" class="skeleton-text" [style.width]="width" [style.height]="height"></div>

      <!-- Card skeleton -->
      <div *ngSwitchCase="'card'" class="skeleton-card">
        <div class="skeleton-card-image"></div>
        <div class="skeleton-card-content">
          <div class="skeleton-text" style="width: 60%; height: 1.2rem;"></div>
          <div class="skeleton-text" style="width: 40%; height: 0.9rem; margin-top: 0.5rem;"></div>
          <div class="skeleton-text" style="width: 80%; height: 0.9rem; margin-top: 0.5rem;"></div>
        </div>
      </div>

      <!-- Table row skeleton -->
      <div *ngSwitchCase="'table-row'" class="skeleton-table-row" [style.grid-template-columns]="'repeat(' + columns + ', 1fr)'">
        <div class="skeleton-cell" *ngFor="let col of columnArray"></div>
      </div>

      <!-- Stat card skeleton -->
      <div *ngSwitchCase="'stat-card'" class="skeleton-stat-card">
        <div class="skeleton-stat-header">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-text" style="width: 80px; height: 0.85rem;"></div>
        </div>
        <div class="skeleton-stat-value"></div>
      </div>

      <!-- List item skeleton -->
      <div *ngSwitchCase="'list-item'" class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-text" style="width: 120px; height: 1.1rem;"></div>
          <div class="skeleton-text" style="width: 180px; height: 0.85rem; margin-top: 0.35rem;"></div>
        </div>
        <div class="skeleton-badge"></div>
      </div>

      <!-- Avatar skeleton -->
      <div *ngSwitchCase="'avatar'" class="skeleton-avatar" [style.width]="width" [style.height]="height"></div>

      <!-- Button skeleton -->
      <div *ngSwitchCase="'button'" class="skeleton-button" [style.width]="width" [style.height]="height"></div>

      <!-- Chart skeleton -->
      <div *ngSwitchCase="'chart'" class="skeleton-chart" [style.height]="height"></div>

      <!-- Default fallback -->
      <div *ngSwitchDefault class="skeleton-text" [style.width]="width" [style.height]="height"></div>
    </ng-container>
  `,
  styles: [`
    /* Base shimmer animation */
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .skeleton-base {
      background: linear-gradient(
        90deg,
        var(--surface, #FAF7F0) 25%,
        var(--bg-secondary, #EFE9DC) 50%,
        var(--surface, #FAF7F0) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.6s ease-in-out infinite;
      border-radius: var(--radius-md, 14px);
    }

    /* Text skeleton */
    .skeleton-text {
      @extend .skeleton-base;
      border-radius: var(--radius-sm, 10px);
    }

    /* Card skeleton */
    .skeleton-card {
      background: var(--card-bg, #FFFFFB);
      border: 2px solid var(--border-color, #E2DAC8);
      border-radius: var(--radius-lg, 18px);
      overflow: hidden;
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(52, 36, 25, 0.05));
    }

    .skeleton-card-image {
      height: 140px;
      @extend .skeleton-base;
      border-radius: 0;
    }

    .skeleton-card-content {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    /* Table row skeleton */
    .skeleton-table-row {
      display: grid;
      grid-template-columns: repeat(var(--col-count, 5), 1fr);
      gap: 1rem;
      padding: 1rem 1.4rem;
      background: var(--surface, #FAF7F0);
      border-radius: var(--radius-md, 14px);
      box-shadow: 0 2px 0 var(--border-color, #E2DAC8);
      border: 1.5px solid var(--border-color, #E2DAC8);
    }

    .skeleton-cell {
      @extend .skeleton-base;
      height: 1.2rem;
      border-radius: var(--radius-sm, 10px);
    }

    .skeleton-cell:first-child { height: 1.5rem; }
    .skeleton-cell:last-child { width: 80px; }

    /* Stat card skeleton */
    .skeleton-stat-card {
      background: var(--card-bg, #FFFFFB);
      border: 2px solid var(--border-color, #E2DAC8);
      border-radius: var(--radius-md, 14px);
      padding: 1.4rem;
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(52, 36, 25, 0.05));
      position: relative;
      min-height: 140px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .skeleton-stat-card::before {
      content: '';
      position: absolute;
      top: -24px;
      right: -24px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--primary-light, #EBF0E3);
      opacity: 0.35;
      z-index: 0;
    }

    .skeleton-stat-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }

    .skeleton-avatar {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md, 14px);
      @extend .skeleton-base;
    }

    .skeleton-stat-value {
      position: relative;
      z-index: 1;
      height: 48px;
      @extend .skeleton-base;
      border-radius: var(--radius-md, 14px);
      width: 60%;
    }

    /* List item skeleton */
    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.85rem 1.1rem;
      background: var(--surface, #FAF7F0);
      border-radius: var(--radius-md, 14px);
      border: 1.5px solid var(--border-color, #E2DAC8);
      box-shadow: 0 2px 0 var(--border-color, #E2DAC8);
    }

    .skeleton-list-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .skeleton-badge {
      width: 90px;
      height: 28px;
      border-radius: var(--radius-full, 9999px);
      @extend .skeleton-base;
    }

    /* Button skeleton */
    .skeleton-button {
      border-radius: var(--radius-full, 9999px);
      @extend .skeleton-base;
    }

    /* Chart skeleton */
    .skeleton-chart {
      background: var(--card-bg, #FFFFFB);
      border: 2px solid var(--border-color, #E2DAC8);
      border-radius: var(--radius-lg, 18px);
      box-shadow: var(--shadow-md, 0 6px 16px rgba(52, 36, 25, 0.06));
      @extend .skeleton-base;
    }

    /* Count variants */
    .skeleton-count-3 .skeleton-text:nth-child(n+4),
    .skeleton-count-5 .skeleton-text:nth-child(n+6) {
      display: none;
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() variant: SkeletonVariant = 'text';
  @Input() count: number = 1;
  @Input() columns: number = 5;
  @Input() width: string = '100%';
  @Input() height: string = '1rem';

  get columnArray(): number[] {
    return Array.from({ length: this.columns }, (_, i) => i);
  }

  get colCount(): string {
    return this.columns.toString();
  }
}