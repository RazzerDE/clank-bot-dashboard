import { TestBed } from '@angular/core/testing';

import { DataHolderService } from './data-holder.service';

describe('DataHolderService', () => {
  let service: DataHolderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataHolderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
