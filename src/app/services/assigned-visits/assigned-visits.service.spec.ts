import { TestBed } from '@angular/core/testing';

import { AssignedVisitsService } from './assigned-visits.service';

describe('AssignedVisitsService', () => {
  let service: AssignedVisitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignedVisitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
