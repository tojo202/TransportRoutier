import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VehicleModel {
  id?: number;
  registration_number: string;
  brand?: string;
  model?: string;
  capacity: number;
  status?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  getVehicles(): Observable<VehicleModel[]> {
    return this.http.get<VehicleModel[]>(this.apiUrl);
  }

  getVehicle(id: number): Observable<VehicleModel> {
    return this.http.get<VehicleModel>(`${this.apiUrl}/${id}`);
  }

  createVehicle(vehicle: VehicleModel): Observable<VehicleModel> {
    return this.http.post<VehicleModel>(this.apiUrl, vehicle);
  }

  updateVehicle(id: number, vehicle: VehicleModel): Observable<VehicleModel> {
    return this.http.put<VehicleModel>(`${this.apiUrl}/${id}`, vehicle);
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

