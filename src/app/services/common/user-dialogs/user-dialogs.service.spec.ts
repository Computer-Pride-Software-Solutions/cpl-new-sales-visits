import { TestBed } from '@angular/core/testing';

import { UserDialogsService } from './user-dialogs.service';

describe('UserDialogsService', () => {
  let service: UserDialogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserDialogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
