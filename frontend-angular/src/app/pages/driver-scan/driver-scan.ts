import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TicketService } from '../../services/ticket';
import { AuthService } from '../../services/auth';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-driver-scan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './driver-scan.html',
  styleUrl: './driver-scan.css'
})
export class DriverScanComponent implements OnInit {
  ticketCode: string = '';
  isScanning: boolean = false;
  scanResult: any = null;
  errorMessage: string = '';
  recentScans: any[] = [];
  scheduleId?: number;

  constructor(
    private ticketService: TicketService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['schedule_id']) {
        this.scheduleId = +params['schedule_id'];
      }
    });
  }

  onScanSubmit(): void {
    if (!this.ticketCode.trim()) return;

    this.isScanning = true;
    this.errorMessage = '';
    this.scanResult = null;

    this.ticketService.scanQr(this.ticketCode.trim(), true).subscribe({
      next: (res) => {
        this.isScanning = false;
        this.scanResult = res;
        this.recentScans.unshift({
          code: this.ticketCode,
          passenger: res.ticket?.reservation?.user?.name || 'Passager',
          seat: res.ticket?.reservation?.seat_number,
          route: res.ticket?.reservation?.schedule?.route ? `${res.ticket.reservation.schedule.route.origin} → ${res.ticket.reservation.schedule.route.destination}` : '',
          time: new Date(),
          valid: true
        });
        this.ticketCode = '';
      },
      error: (err) => {
        this.isScanning = false;
        this.errorMessage = err.error?.message || 'Billet invalide ou introuvable.';
        this.scanResult = { valid: false, message: this.errorMessage };
        this.recentScans.unshift({
          code: this.ticketCode,
          passenger: 'Inconnu',
          seat: '-',
          time: new Date(),
          valid: false
        });
      }
    });
  }

  quickTest(code: string): void {
    this.ticketCode = code;
    this.onScanSubmit();
  }
}
