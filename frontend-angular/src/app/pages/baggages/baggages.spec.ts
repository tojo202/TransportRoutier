import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Baggages } from './baggages';

describe('Baggages', () => {
  let component: Baggages;
  let fixture: ComponentFixture<Baggages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Baggages],
    }).compileComponents();

    fixture = TestBed.createComponent(Baggages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
