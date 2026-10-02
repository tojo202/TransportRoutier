import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-vertical-pagination',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './vertical-pagination.html',
  styleUrls: ['./vertical-pagination.css']
})
export class VerticalPaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  goTo(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.pageChange.emit(this.currentPage);
    }
  }

  prev() { this.goTo(this.currentPage - 1); }
  next() { this.goTo(this.currentPage + 1); }
}
