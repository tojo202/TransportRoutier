import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyService } from '../../services/agency';
import { AgenciesComponent } from './agencies';

describe('Agences', () => {
  let component: AgenciesComponent;
  let fixture: ComponentFixture<AgenciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgenciesComponent],
      providers: [{ provide: AgencyService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(AgenciesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});