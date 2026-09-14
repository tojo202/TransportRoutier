import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyService } from '../../services/agency';
import { DriverService } from '../../services/driver';
import { DriversComponent } from './drivers';

describe('Chauffeurs', () => {
  let component: DriversComponent;
  let fixture: ComponentFixture<DriversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriversComponent],
      providers: [{ provide: DriverService, useValue: {} }, { provide: AgencyService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(DriversComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});