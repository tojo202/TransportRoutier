import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col">
      <div class="section-badge-wrap">
        <span class="material-icons" *ngIf="icon">{{ icon }}</span>
        <span class="section-tagline">{{ tagline }}</span>
      </div>
      <h2 class="section-title" *ngIf="title">{{ title }}</h2>
      <p class="section-desc" *ngIf="description">{{ description }}</p>
    </div>
  `
})
export class SectionBadgeComponent {
  @Input() tagline: string = '';
  @Input() icon?: string;
  @Input() title: string = '';
  @Input() description: string = '';
}
