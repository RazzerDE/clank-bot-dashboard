import { TestBed } from '@angular/core/testing';

import { DiscordComService } from './discord-com.service';

describe('DiscordComService', () => {
  let service: DiscordComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscordComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
