import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getStats(filter: string = 'all', startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams().set('filter', filter);
    if (filter === 'custom' && startDate && endDate) {
      params = params.set('startDate', startDate).set('endDate', endDate);
    }
    return this.http.get<any>(`${this.apiUrl}/stats`, { params });
  }
}
