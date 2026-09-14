import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverService } from '../../services/driver';
import { RouteService } from '../../services/route';
import { ScheduleService } from '../../services/schedule';
import { VehicleService } from '../../services/vehicle';
import { SchedulesComponent } from './schedules';

describe('Horaires', () => {
  let component: SchedulesComponent;
  let fixture: ComponentFixture<SchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulesComponent],
      providers: [
        { provide: ScheduleService, useValue: {} },
        { provide: RouteService, useValue: {} },
        { provide: VehicleService, useValue: {} },
        { provide: DriverService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SchedulesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});