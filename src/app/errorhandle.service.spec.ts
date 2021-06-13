import { TestBed } from '@angular/core/testing';

import { ErrorhandleService } from './errorhandle.service';

describe('ErrorhandleService', () => {
  let service: ErrorhandleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorhandleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
