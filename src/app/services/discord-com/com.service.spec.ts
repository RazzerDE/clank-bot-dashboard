import { TestBed } from '@angular/core/testing';

import { ComService } from './com.service';
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {AuthService} from "../auth/auth.service";
import { HttpHeaders, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {config} from "../../../environments/config";
import {Channel, Guild, Role} from "../types/discord/Guilds";
import {SupportThemeResponse} from "../types/Tickets";
import {Observable} from "rxjs";

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

  it('should fetch guilds', async () => {
    const mockGuilds: Guild[] = [{ id: '1', name: 'Guild 1' }, { id: '2', name: 'Guild 2' }] as Guild[];

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

    (await service.setSupportForum(guild_id, channel_id)).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${config.api_url}/guilds/support-forum?guild_id=${guild_id}&channel_id=${channel_id}`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should fetch guild emojis for a specific guild', async () => {
    const mockEmojis = [{ id: '1', name: 'smile' }, { id: '2', name: 'wink' }];

    const result = await service.getGuildEmojis('guild_id');

    result.subscribe(emojis => {
      expect(emojis).toEqual(mockEmojis);
    });

    const req = httpMock.expectOne(`${config.api_url}/guilds/emojis?guild_id=guild_id`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEmojis);
  });

  it('should fetch guild roles for a specific guild', async () => {
    const mockRoles: Role[] = [{ id: '1', name: 'Role 1' }, { id: '2', name: 'Role 2' }] as Role[];

    const result = await service.getGuildRoles('guild_id');

    result.subscribe(roles => {
      expect(roles).toEqual(mockRoles);
    });

    const req = httpMock.expectOne(`${config.api_url}/guilds/roles?guild_id=guild_id`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRoles);
  });

  it('should wait for initialization before fetching guild roles', async () => {
    const httpGetSpy = jest.spyOn(service['http'], 'get').mockReturnValueOnce({
      subscribe: jest.fn()
    } as any);

    await service.getGuildRoles('guild_id');
    expect(httpGetSpy).toHaveBeenCalledWith(`${config.api_url}/guilds/roles?guild_id=guild_id`, {withCredentials: true});
  });

  it('should fetch guild channels for a specific guild', async () => {
    const mockChannels = [{ id: '1', name: 'Channel 1' }, { id: '2', name: 'Channel 2' }];

    const result = await service.getGuildChannels('guild_id');

    result.subscribe(channels => {
      expect(channels).toEqual(mockChannels);
    });

    const req = httpMock.expectOne(`${config.api_url}/guilds/channels?guild_id=guild_id`);
    expect(req.request.method).toBe('GET');
    req.flush(mockChannels);
  });

  it('should wait for initialization before fetching guild channels', async () => {
    const httpGetSpy = jest.spyOn(service['http'], 'get').mockReturnValueOnce({
      subscribe: jest.fn()
    } as unknown as Observable<Channel[]>);

    await service.getGuildChannels('guild_id');
    expect(httpGetSpy).toHaveBeenCalledWith(`${config.api_url}/guilds/channels?guild_id=guild_id`, {withCredentials: true});
  });

  it('should fetch support themes for a specific guild', async () => {
    const mockSupportThemes: SupportThemeResponse = { themes: [{ id: '1', name: 'Theme 1' }] } as SupportThemeResponse;

    const result = await service.getSupportThemes('guild_id');

    result.subscribe(themes => {
      expect(themes).toEqual(mockSupportThemes);
    });

    const req = httpMock.expectOne(`${config.api_url}/guilds/support-themes?guild_id=guild_id`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSupportThemes);
  });

  it('should change default mention roles for a specific guild', async () => {
    const guild_id = 'guild_id';
    const role_ids = ['role1', 'role2'];

    const httpPostSpy = jest.spyOn(service['http'], 'post');
    const mockResponse = { success: true };
    httpPostSpy.mockReturnValueOnce({
      subscribe: (cb: any) => cb(mockResponse)
    } as any);

    const result = await service.changeDefaultMention(guild_id, role_ids);

    expect(httpPostSpy).toHaveBeenCalledWith(
      `${config.api_url}/guilds/support-themes/default-mention?guild_id=${guild_id}`,
      { role_ids }, {withCredentials: true});

    result.subscribe((res: any) => {
      expect(res).toEqual(mockResponse);
    });
  });
});
