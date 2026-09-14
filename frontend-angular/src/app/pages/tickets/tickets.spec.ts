import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketService } from '../../services/ticket';
import { TicketsComponent } from './tickets';

describe('Billets', () => {
  let component: TicketsComponent;
  let fixture: ComponentFixture<TicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketsComponent],
      providers: [{ provide: TicketService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});