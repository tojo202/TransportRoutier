import { TestBed } from '@angular/core/testing';

import { Agency } from './agency';

describe('Agency', () => {
  let service: Agency;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Agency);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
