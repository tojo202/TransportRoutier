import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthService } from '../../services/auth';
import { Profile } from './profile';

describe('Profil', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [{ provide: AuthService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});