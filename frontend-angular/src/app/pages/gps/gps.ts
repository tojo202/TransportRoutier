import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GpsService } from '../../services/gps';
import * as L from 'leaflet';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-gps',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSelectModule, 
    MatFormFieldModule, 
    FormsModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  providers: [DatePipe],
  templateUrl: './gps.html',
  styleUrls: ['./gps.css']
})
export class GPSComponent implements OnInit, AfterViewInit, OnDestroy {
  map!: L.Map;
  markers: L.Marker[] = [];
  locations: any[] = [];
  filteredLocations: any[] = [];
  isLoading = true;
  error = '';
  
  refreshInterval: any;
  
  filterAgency = '';
  filterStatus = '';
  agencies: string[] = [];
  
  selectedVehicleHistory: any[] = [];
  showHistoryModal = false;

  constructor(
    private gpsService: GpsService,
    private datePipe: DatePipe,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // We will initialize data first, then map
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadLocations();
    
    // Auto refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadLocations(false);
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  initMap(): void {
    // Center of Madagascar approximately
    this.map = L.map('map').setView([-18.8792, 47.5079], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  loadLocations(showLoader = true): void {
    if (showLoader) this.isLoading = true;
    this.error = '';
    
    this.gpsService.getLocations().subscribe({
      next: (data) => {
        this.locations = data;
        this.extractAgencies();
        this.applyFilters();
        if (showLoader) this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des positions GPS.';
        if (showLoader) this.isLoading = false;
        console.error(err);
      }
    });
  }

  extractAgencies(): void {
    const agSet = new Set<string>();
    this.locations.forEach(loc => {
      if (loc.vehicle?.agency?.name) {
        agSet.add(loc.vehicle.agency.name);
      }
    });
    this.agencies = Array.from(agSet);
  }

  applyFilters(): void {
    this.filteredLocations = this.locations.filter(loc => {
      let matchAgency = true;
      let matchStatus = true;
      
      if (this.filterAgency && loc.vehicle?.agency?.name !== this.filterAgency) {
        matchAgency = false;
      }
      if (this.filterStatus && loc.vehicle?.status !== this.filterStatus) {
        matchStatus = false;
      }
      return matchAgency && matchStatus;
    });
    
    this.updateMarkers();
  }

  updateMarkers(): void {
    // Clear existing markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    // Custom Icon
    const defaultIcon = L.icon({
      iconUrl: 'assets/marker-icon.png', // Fallback or standard Leaflet icon if missing
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    // Fix for missing default icons in Leaflet with Angular
    L.Marker.prototype.options.icon = L.icon({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });

    this.filteredLocations.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        const marker = L.marker([loc.latitude, loc.longitude]).addTo(this.map);
        
        const content = `
          <div class="p-2 min-w-[200px]">
            <h3 class="font-bold border-b pb-1 mb-2">Véhicule ${loc.vehicle?.plate_number || 'N/A'}</h3>
            <p class="text-sm m-1"><b>Agence:</b> ${loc.vehicle?.agency?.name || 'N/A'}</p>
            <p class="text-sm m-1"><b>Statut:</b> <span class="px-2 py-0.5 rounded text-xs ${loc.vehicle?.status === 'in_transit' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}">${loc.vehicle?.status || 'N/A'}</span></p>
            <p class="text-sm m-1"><b>Vitesse:</b> ${loc.speed || 0} km/h</p>
            <p class="text-sm m-1 text-gray-500">Mis à jour: ${this.datePipe.transform(loc.recorded_at, 'short')}</p>
            <button class="mt-2 w-full bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700" onclick="window.angularComponentRef.viewHistory(${loc.vehicle_id})">Voir l'historique</button>
          </div>
        `;
        
        marker.bindPopup(content);
        this.markers.push(marker);
      }
    });

    // Make angularComponentRef available for the popup button
    (window as any).angularComponentRef = {
      viewHistory: (vehicleId: number) => {
        this.viewHistory(vehicleId);
      }
    };
  }

  viewHistory(vehicleId: number): void {
    this.gpsService.getHistory(vehicleId).subscribe({
      next: (data) => {
        this.selectedVehicleHistory = data;
        this.showHistoryModal = true;
      },
      error: (err) => {
        console.error('Erreur historique', err);
      }
    });
  }
  
  closeHistory(): void {
    this.showHistoryModal = false;
  }

  recenterMap(): void {
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    } else {
      this.map.setView([-18.8792, 47.5079], 6);
    }
  }

  toggleFullScreen(): void {
    const mapElement = document.getElementById('map-container');
    if (!document.fullscreenElement) {
      mapElement?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }
}
