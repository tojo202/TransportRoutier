import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth';
import { QrCodeService } from '../../services/qrcode.service';
import { ReservationService } from '../../services/reservation';
import { ScheduleService } from '../../services/schedule';
import { ReviewService } from '../../services/review';
import { HomeComponent } from './home';

describe('Home', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: ScheduleService, useValue: { getSchedules: () => ({ subscribe: () => ({}) }) } },
        { provide: ReservationService, useValue: {} },
        { provide: AuthService, useValue: { getCurrentUser: () => null } },
        { provide: QrCodeService, useValue: {} },
        { provide: ReviewService, useValue: { getReviews: () => ({ subscribe: () => ({}) }) } },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});