import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

@Injectable({
  providedIn: 'root'
})
export class AgencyService {
  private apiUrl = `${environment.apiUrl}/agencies`;

  constructor(private http: HttpClient) { }

  getAgencies(filters?: { search?: string; page?: number; per_page?: number }): Observable<Agency[] | PaginatedResponse<Agency>> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.per_page) params = params.set('per_page', filters.per_page.toString());
    }
    return this.http.get<Agency[] | PaginatedResponse<Agency>>(this.apiUrl, { params });
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
