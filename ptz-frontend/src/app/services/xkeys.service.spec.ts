import { TestBed } from '@angular/core/testing';

import { XkeysService } from './xkeys.service';

describe('XkeysService', () => {
  let service: XkeysService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XkeysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
