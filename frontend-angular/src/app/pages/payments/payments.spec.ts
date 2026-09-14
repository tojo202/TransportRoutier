import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentService } from '../../services/payment';
import { PaymentsComponent } from './payments';

describe('Paiements', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsComponent],
      providers: [{ provide: PaymentService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});