import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Review {
  id?: number;
  user_id?: number;
  driver_id: number;
  schedule_id?: number;
  rating: number;
  comment?: string;
  created_at?: string;
  user?: {
    id: number;
    name: string;
  };
  driver?: {
    id: number;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getReviews(driverId?: number, scheduleId?: number, perPage?: number): Observable<any> {
    let url = this.apiUrl;
    const params: string[] = [];
    if (driverId) params.push(`driver_id=${driverId}`);
    if (scheduleId) params.push(`schedule_id=${scheduleId}`);
    if (perPage) params.push(`per_page=${perPage}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    return this.http.get<any>(url);
  }

  createReview(review: Review): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  getDriverStats(driverId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/drivers/${driverId}/stats`);
  }
}
