import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GpsService {
  private apiUrl = `${environment.apiUrl}/gps-locations`;

  constructor(private http: HttpClient) { }

  getLocations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  
  getHistory(vehicleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?vehicle_id=${vehicleId}`);
  }
}
