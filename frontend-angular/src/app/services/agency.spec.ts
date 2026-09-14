import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AgencyService } from './agency';

describe('AgencyService', () => {
  let service: AgencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AgencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
