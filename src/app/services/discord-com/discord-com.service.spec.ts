import { TestBed } from '@angular/core/testing';

import { DiscordComService } from './discord-com.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";

describe('DiscordComService', () => {
  let service: DiscordComService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    });
    service = TestBed.inject(DiscordComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
