import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Route {
  id?: number;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimated_duration: string;
  agency_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = `${environment.apiUrl}/routes`;

  constructor(private http: HttpClient) { }

  getRoutes(): Observable<Route[]> {
    return this.http.get<Route[]>(this.apiUrl);
  }

  getRoute(id: number): Observable<Route> {
    return this.http.get<Route>(`${this.apiUrl}/${id}`);
  }

  createRoute(route: Route): Observable<Route> {
    return this.http.post<Route>(this.apiUrl, route);
  }

  updateRoute(id: number, route: Partial<Route>): Observable<Route> {
    return this.http.put<Route>(`${this.apiUrl}/${id}`, route);
  }

  deleteRoute(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
