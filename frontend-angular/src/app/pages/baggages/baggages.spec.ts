import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaggageService } from '../../services/baggage';
import { BaggagesComponent } from './baggages';

describe('Bagages', () => {
  let component: BaggagesComponent;
  let fixture: ComponentFixture<BaggagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaggagesComponent],
      providers: [{ provide: BaggageService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(BaggagesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});