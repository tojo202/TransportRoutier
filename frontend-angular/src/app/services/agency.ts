import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Agency {
  id?: number;
  name: string;
  address: string;
  phone: string;
  manager_name?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgencyService {
  private apiUrl = `${environment.apiUrl}/agencies`;

  constructor(private http: HttpClient) { }

  getAgencies(): Observable<Agency[]> {
    return this.http.get<Agency[]>(this.apiUrl);
  }

  getAgency(id: number): Observable<Agency> {
    return this.http.get<Agency>(`${this.apiUrl}/${id}`);
  }

  createAgency(agency: Agency): Observable<Agency> {
    return this.http.post<Agency>(this.apiUrl, agency);
  }

  updateAgency(id: number, agency: Partial<Agency>): Observable<Agency> {
    return this.http.put<Agency>(`${this.apiUrl}/${id}`, agency);
  }

  deleteAgency(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
