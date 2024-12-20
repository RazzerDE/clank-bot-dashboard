import { TestBed } from '@angular/core/testing';

import { DataHolderService } from './data-holder.service';
import {TranslateModule} from "@ngx-translate/core";

describe('DataHolderService', () => {
  let service: DataHolderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()]
    });
    service = TestBed.inject(DataHolderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
