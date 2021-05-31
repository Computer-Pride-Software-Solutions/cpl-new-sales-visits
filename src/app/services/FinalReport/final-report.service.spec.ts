import { TestBed } from '@angular/core/testing';

import { FinalReportService } from './final-report.service';

describe('FinalReportService', () => {
  let service: FinalReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinalReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
