import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id?: number;
  schedule_id: number;
  user_id?: number;
  message: string;
  created_at?: string;
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  getMessages(scheduleId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}?schedule_id=${scheduleId}`);
  }

  sendMessage(scheduleId: number, message: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(this.apiUrl, {
      schedule_id: scheduleId,
      message: message
    });
  }
}
