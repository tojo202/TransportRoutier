import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyService } from '../../services/agency';
import { VehicleService } from '../../services/vehicle';
import { VehiclesComponent } from './vehicles';

describe('Véhicules', () => {
  let component: VehiclesComponent;
  let fixture: ComponentFixture<VehiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiclesComponent],
      providers: [{ provide: VehicleService, useValue: {} }, { provide: AgencyService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiclesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});