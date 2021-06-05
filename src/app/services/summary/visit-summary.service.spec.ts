import { TestBed } from '@angular/core/testing';

import { VisitSummaryService } from './visit-summary.service';

describe('VisitSummaryService', () => {
  let service: VisitSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisitSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
