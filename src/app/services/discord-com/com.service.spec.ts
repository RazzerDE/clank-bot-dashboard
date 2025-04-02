import { TestBed } from '@angular/core/testing';

import { ComService } from './com.service';
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {AuthService} from "../auth/auth.service";
import { HttpHeaders, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {config} from "../../../environments/config";
import {Guild, Role} from "../types/discord/Guilds";

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

    const req = httpMock.expectOne(`${config.api_url}/guilds`);
    expect(req.request.method).toBe('GET');
    req.flush(mockGuilds);
  });

  it('should fetch team roles for a specific guild', async () => {
    const mockRoles: Role[] = [{ id: '1', name: 'Role 1' }, { id: '2', name: 'Role 2' }] as Role[];
    service['isInitialized'] = true;

    const result = await service.getTeamRoles('guild_id');

    result.subscribe(roles => {
      expect(roles).toEqual(mockRoles);
    });

    const req = httpMock.expectOne(`${config.api_url}/guilds/team?guild_id=guild_id`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRoles);
  });

  it('should remove a team role from a specific guild', async () => {
    const guild_id = 'guild_id';
    const role_id = 'role_id';

    service['isInitialized'] = true;

    (await service.removeTeamRole(guild_id, role_id)).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${config.api_url}/guilds/team?guild_id=${guild_id}&role_id=${role_id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should add a team role to a specific guild', async () => {
    const guild_id = 'guild_id';
    const role_id = 'role_id';
    const level = 'level';

    service['isInitialized'] = true;

    (await service.addTeamRole(guild_id, role_id, level)).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${config.api_url}/guilds/team?guild_id=${guild_id}&role_id=${role_id}&level=${level}`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should set a support forum to specific id', async () => {
    const guild_id = '123';
    const channel_id = '456';

    service['isInitialized'] = true;

    (await service.setSupportForum(guild_id, channel_id)).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${config.api_url}/guilds/support-forum?guild_id=${guild_id}&channel_id=${channel_id}`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
