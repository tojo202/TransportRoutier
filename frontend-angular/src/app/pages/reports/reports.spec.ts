import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardService } from '../../services/dashboard';
import { ReportService } from '../../services/report';
import { ReportsComponent } from './reports';

describe('Rapports', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [{ provide: ReportService, useValue: {} }, { provide: DashboardService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});