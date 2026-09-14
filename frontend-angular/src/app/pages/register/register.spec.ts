import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth';
import { RegisterComponent } from './register';

describe('Register', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: { register: () => ({ subscribe: () => ({}) }), getCurrentUser: () => null } },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require password confirmation to match', () => {
    component.model.password = 'secret1';
    component.model.password_confirmation = 'different';
    component.onSubmit({ invalid: false, controls: {} } as any);
    expect(component.error).toContain('mots de passe');
  });
});