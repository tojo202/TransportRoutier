import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteService } from '../../services/route';
import { RoutesComponent } from './routes';

describe('Routes', () => {
  let component: RoutesComponent;
  let fixture: ComponentFixture<RoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutesComponent],
      providers: [{ provide: RouteService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});