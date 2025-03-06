import { TestBed } from '@angular/core/testing';

import { ComService } from './com.service';
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {AuthService} from "../auth/auth.service";
import { HttpHeaders, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {config} from "../../../environments/config";
import {Guild} from "../types/discord/Guilds";

describe('DiscordComService', () => {
  let service: ComService;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot()],
    providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: AuthService, useValue: { headers: new HttpHeaders({ 'Authorization': 'Bearer token' }),
                setAuthorizationHeader: jest.fn() } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(ComService);
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize the service and set authorization header on storage event', (done) => {
    const authServiceSpy = jest.spyOn(authService, 'setAuthorizationHeader').mockReturnValue(new HttpHeaders({ 'Authorization': 'Bearer mock_token' }));
    localStorage.setItem('access_token', 'mock_token');

    const event = new StorageEvent('storage', { key: 'access_token', newValue: 'mock_token' });
    window.dispatchEvent(event);

    service['initPromise'].then(() => {
      expect(authServiceSpy).toHaveBeenCalledWith('mock_token');
      expect(service['isInitialized']).toBe(true);
      done();
    });
  });

  it('should ensure the service is initialized', (done) => {
    service['isInitialized'] = false;
    (service as any).ensureInitialized().then(() => {});

    done();
  });

  it('should fetch guilds', async () => {
    const mockGuilds: Guild[] = [{ id: '1', name: 'Guild 1' }, { id: '2', name: 'Guild 2' }] as Guild[];
    service['isInitialized'] = true;

    const result = await service.getGuilds();

    result.subscribe(guilds => {
      expect(guilds).toEqual(mockGuilds);
    });

    const req = httpMock.expectOne(`${config.api_url}/users/@me/guilds?with_counts=True`);
    expect(req.request.method).toBe('GET');
    req.flush(mockGuilds);
  });
});
