import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationService } from '../../services/reservation';
import { ScheduleService } from '../../services/schedule';
import { ReservationsComponent } from './reservations';

describe('Réservations', () => {
  let component: ReservationsComponent;
  let fixture: ComponentFixture<ReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationsComponent],
      providers: [{ provide: ReservationService, useValue: {} }, { provide: ScheduleService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});