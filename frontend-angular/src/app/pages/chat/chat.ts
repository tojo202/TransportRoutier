import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChatService, ChatMessage } from '../../services/chat';
import { ScheduleService, Schedule } from '../../services/schedule';
import { AuthService } from '../../services/auth';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  scheduleId: number = 1;
  schedule: Schedule | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  isSending: boolean = false;
  private pollInterval: any;

  allSchedules: Schedule[] = [];

  constructor(
    private chatService: ChatService,
    private scheduleService: ScheduleService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['schedule_id']) {
        this.scheduleId = +params['schedule_id'];
      }
      this.loadAllSchedules();
      this.loadScheduleAndMessages();
    });

    // Start Polling every 4 seconds
    this.pollInterval = setInterval(() => {
      this.refreshMessages();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadAllSchedules(): void {
    this.scheduleService.getSchedules().subscribe(data => {
      this.allSchedules = Array.isArray(data) ? data : (data.data || []);
      if (!this.scheduleId && this.allSchedules.length > 0) {
        this.scheduleId = this.allSchedules[0].id!;
        this.loadScheduleAndMessages();
      }
    });
  }

  switchSchedule(id: number): void {
    this.scheduleId = id;
    this.loadScheduleAndMessages();
  }

  loadScheduleAndMessages(): void {
    if (!this.scheduleId) return;
    this.isLoading = true;

    this.scheduleService.getSchedule(this.scheduleId).subscribe({
      next: (s) => this.schedule = s,
      error: () => {}
    });

    this.chatService.getMessages(this.scheduleId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  refreshMessages(): void {
    if (!this.scheduleId) return;
    this.chatService.getMessages(this.scheduleId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.scheduleId) return;

    const text = this.newMessage.trim();
    this.newMessage = '';
    this.isSending = true;

    this.chatService.sendMessage(this.scheduleId, text).subscribe({
      next: (msg) => {
        this.isSending = false;
        this.messages.push(msg);
      },
      error: (err) => {
        this.isSending = false;
        alert('Erreur lors de l\'envoi du message');
      }
    });
  }
}
