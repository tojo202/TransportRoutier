import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaggageService {
  private apiUrl = `${environment.apiUrl}/baggages`;

  constructor(private http: HttpClient) { }

  getBaggages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getBaggage(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createBaggage(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateBaggage(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteBaggage(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
