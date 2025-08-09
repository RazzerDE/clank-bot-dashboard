import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import { DataHolderService } from './data-holder.service';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {defer} from "rxjs";
import {ComService} from "../discord-com/com.service";
import {Channel, Emoji, Guild, initEmojis, Role} from "../types/discord/Guilds";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ApiService} from "../api/api.service";
import {SecurityLogs, UnbanRequest} from "../types/Security";
import {MarkdownPipe} from "../../pipes/markdown/markdown.pipe";
import {ConvertTimePipe} from "../../pipes/convert-time.pipe";
import {EmbedConfigRaw} from "../types/Config";

describe('DataHolderService', () => {
  let service: DataHolderService;
  let router: Router;
  let translate: TranslateService;
  let comService: ComService;
  let apiService: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {}}
      ]
    });

    localStorage.setItem('active_guild', 'true');
    router = TestBed.inject(Router);
    translate = TestBed.inject(TranslateService);
    service = TestBed.inject(DataHolderService);
    comService = TestBed.inject(ComService);
    apiService = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();

    translate.use('en');
    expect(service.error_title).not.toBe('');
  });

  it('should set showSidebarLogo to true and active_guild from localStorage if active_guild exists', () => {
    const mockGuild = { id: 'guild1', name: 'Test Guild' };
    localStorage.setItem('active_guild', JSON.stringify(mockGuild));

    (service as any).initializeFromLocalStorage();

    expect(service.showSidebarLogo).toBe(true);
    expect(service.active_guild).toEqual(mockGuild);
    localStorage.removeItem('active_guild');
  });

  it('should not set showSidebarLogo or active_guild if active_guild does not exist in localStorage', () => {
    localStorage.removeItem('active_guild');
    service.showSidebarLogo = false;
    service.active_guild = null;

    (service as any).initializeFromLocalStorage();

    expect(service.showSidebarLogo).toBe(false);
    expect(service.active_guild).toBeNull();
  });

  it('should return the correct built discord emoji if emoji_name is true', () => {
    const emojiId = '123456789';
    const result = service.getEmojibyId(emojiId, false, true, 'testEmoji');
    expect(result).toBe('<a:testEmoji:123456789>');

    // non animated emoji
    const result2 = service.getEmojibyId(emojiId, false, false, 'testEmoji');
    expect(result2).toBe('<:testEmoji:123456789>');
  });

  it('should return the correct CDN URL for emoji ID with isID true and isAnimated true', () => {
    const emojiId = '123456789';
    const result = service.getEmojibyId(emojiId, true, true);
    expect(result).toBe('https://cdn.discordapp.com/emojis/123456789.gif');
  });

  it('should return the correct CDN URL for emoji ID with isID true and isAnimated false', () => {
    const emojiId = '987654321';
    const result = service.getEmojibyId(emojiId, true, false);
    expect(result).toBe('https://cdn.discordapp.com/emojis/987654321.png');
  });

  it('should return the correct CDN URL for a static emoji string', () => {
    const emoji = '<:smile:123456789>';
    const result = service.getEmojibyId(emoji);
    expect(result).toBe('https://cdn.discordapp.com/emojis/123456789.png');
  });

  it('should return the correct CDN URL for an animated emoji string', () => {
    const emoji = '<a:wave:987654321>';
    const result = service.getEmojibyId(emoji);
    expect(result).toBe('https://cdn.discordapp.com/emojis/987654321.gif');
  });

  it('should return the original string if emoji format is invalid', () => {
    const emoji = 'not-an-emoji';
    const result = service.getEmojibyId(emoji);
    expect(result).toBe('not-an-emoji');
  });

  it('should return the input if emoji is empty', () => {
    const emoji = '';
    const result = service.getEmojibyId(emoji);
    expect(result).toBe('');
  });

  it('should return early if active_guild is not set', () => {
    service.active_guild = null;
    service.isFetching = false;
    service.getGuildChannels(comService, false);
    expect(service.isFetching).toBe(false);
  });

  it('should redirect to error page with correct title and description for UNKNOWN error', () => {
    const routerSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    service.redirectLoginError('UNKNOWN');

    expect(service.error_title).toBe('ERROR_UNKNOWN_TITLE');
    expect(service.error_desc).toBe('ERROR_UNKNOWN_DESC');
    expect(routerSpy).toHaveBeenCalledWith('/errors/simple');
  });

  it('should redirect to error page with correct title and description for other error types', () => {
    const routerSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    service.redirectLoginError('NO_CLANK');

    expect(service.error_title).toBe('ERROR_LOGIN_NO_CLANK_TITLE');
    expect(service.error_desc).toBe('ERROR_LOGIN_NO_CLANK_DESC');
    expect(routerSpy).toHaveBeenCalledWith('/errors/simple');
  });

  it('should display an alert box with the specified title and description', () => {
    const title = 'Test Title';
    const desc = 'Test Description';
    service.showAlertBox = true;

    jest.useFakeTimers();
    service.showAlert(title, desc);
    jest.advanceTimersByTime(5001);

    expect(service.error_title).toBe(title);
    expect(service.error_desc).toBe(desc);
    expect(service.showAlertBox).toBeFalsy();
  });

  it('should return void if router url is /errors/simple', () => {
    const title = 'Test Title';
    const desc = 'Test Description';
    service.showAlertBox = false;
    service.error_title = '';
    service.error_desc = '';
    Object.defineProperty(service['router'], 'url', { value: '/errors/simple' });

    jest.useFakeTimers();
    service.showAlert(title, desc);
    jest.advanceTimersByTime(5001);

    expect(service.error_title).toBe('');
    expect(service.error_desc).toBe('');
    expect(service.showAlertBox).toBeFalsy();
  });

  it('should return true if darkMode is set to "true" in localStorage', () => {
    localStorage.setItem('dark', 'true');

    let result: boolean = service.getThemeFromLocalStorage();

    expect(result).toBe(true);

    localStorage.removeItem('dark');

    result = service.getThemeFromLocalStorage();
    expect(result).toBe(false);
  });

  it('should toggle the theme and update localStorage', () => {
    const applyThemeSpy = jest.spyOn(service, 'applyTheme');
    service.isDarkTheme = false;

    service.toggleTheme();

    expect(service.isDarkTheme).toBe(true);
    expect(localStorage.getItem('dark')).toBe('true');
    expect(applyThemeSpy).toHaveBeenCalled();

    service.toggleTheme();

    expect(service.isDarkTheme).toBe(false);
    expect(localStorage.getItem('dark')).toBe('false');
    expect(applyThemeSpy).toHaveBeenCalledTimes(2);
  });

  it('should toggle the visibility of the mobile sidebar', () => {
    const initialVisibility = service.showMobileSidebar;
    service.toggleSidebar();
    expect(service.showMobileSidebar).toBe(!initialVisibility);
  });

  it('should redirect to FORBIDDEN error page on 403 status', () => {
    const redirectSpy = jest.spyOn(service, 'redirectLoginError');
    const errorResponse = new HttpErrorResponse({ status: 403 });

    service.handleApiError(errorResponse);

    expect(redirectSpy).toHaveBeenCalledWith('FORBIDDEN');
  });

  it('should redirect to NO_CLANK error page on 401 status', () => {
    const redirectSpy = jest.spyOn(service, 'redirectLoginError');
    const errorResponse = new HttpErrorResponse({ status: 401 });

    service.handleApiError(errorResponse);

    expect(redirectSpy).toHaveBeenCalledWith('NO_CLANK');
  });

  it('should redirect to REQUESTS error page on 429 status', () => {
    const redirectSpy = jest.spyOn(service, 'redirectLoginError');
    const errorResponse = new HttpErrorResponse({ status: 429 });

    service.handleApiError(errorResponse);

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  });

  it('should redirect to OFFLINE error page on 0 status', () => {
    const redirectSpy = jest.spyOn(service, 'redirectLoginError');
    const errorResponse = new HttpErrorResponse({ status: 0 });

    service.handleApiError(errorResponse);

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
  });

  it('should set isLoading to false for other statuses', () => {
    const errorResponse = new HttpErrorResponse({ status: 500 });

    service.handleApiError(errorResponse);

    expect(service.isLoading).toBe(false);
  });

  it('should use cached channels from localStorage if cache is valid and no_cache is false', () => {
    service.active_guild = { id: 'guild1' } as any;
    const channels = [{ id: '1' }, { id: '2' }];
    localStorage.setItem('guild_channels', JSON.stringify(channels));
    localStorage.setItem('guild_channels_timestamp', (Date.now()).toString());

    service.getGuildChannels({} as any);

    expect(service.guild_channels).toEqual(channels);
    expect(service.isFetching).toBe(false);
  });

  it('should return early if active_guild is not set', () => {
    service.active_guild = null;
    service.isFetching = false;
    service.getGuildChannels({} as any);
    expect(service.isFetching).toBe(false);
  });

  it('should return empty string and not update req_element if value is null or empty', () => {
    document.body.innerHTML = '<span id="req_element"></span>';
    expect(service.getGWRequirementValue(null)).toBe('');
    expect(service.getGWRequirementValue('')).toBe('');
    expect(document.getElementById('req_element')!.innerHTML).toBe('');
  });

  it('should create pipes if they are not already created', () => {
    document.body.innerHTML = '<span id="req_element"></span>';
    service['markdownPipe'] = undefined;
    service['convertTimePipe'] = undefined;

    expect(service.getGWRequirementValue('OWN: test123')).toBe('test123');
    expect(document.getElementById('req_element')!.innerHTML).toBe('test123');
  });

  it('should handle MSG, VOICE, MITGLIED, SERVER, ROLE_ID, OWN, no_nitro and default cases correctly', () => {
    document.body.innerHTML = '<span id="req_element"></span>';
    const reqElement = document.getElementById('req_element') as HTMLSpanElement;
    service['markdownPipe'] = new MarkdownPipe();
    service['convertTimePipe'] = new ConvertTimePipe();

    jest.spyOn(service['markdownPipe']!, 'transform').mockImplementation((v) => `md:${v}`);
    jest.spyOn(service['convertTimePipe']!, 'transform').mockImplementation((v) => `t:${v}`);
    jest.spyOn(service['convertTimePipe']!, 'convertToFormattedTime').mockImplementation((v) => `ft:${v}`);
    jest.spyOn(service['translate'], 'instant').mockImplementation((key, obj) => `${key}:${JSON.stringify(obj)}`);

    // MSG
    expect(service.getGWRequirementValue('MSG: 10')).toBe('10');
    expect(reqElement.innerHTML).toBe('md:PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_MSG:{"count":"10"}');

    // VOICE
    expect(service.getGWRequirementValue('VOICE: 3600')).toBe('ft:3600');
    expect(reqElement.innerHTML).toBe('md:PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_VOICE:{"voicetime":"t:3600"}');

    // MITGLIED
    expect(service.getGWRequirementValue('MITGLIED: 1234')).toBe('ft:1234');
    expect(reqElement.innerHTML).toBe('md:PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_MEMBER:{"membership":"t:1234"}');

    // SERVER
    expect(service.getGWRequirementValue('SERVER: xyz - test')).toBe('xyz');
    expect(reqElement.innerHTML).toBe('md:PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_SERVER:{"server":"xyz"}');

    // ROLE_ID
    expect(service.getGWRequirementValue('ROLE_ID: 42')).toBe('42');
    expect(reqElement.innerHTML).toBe('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_ROLE:undefined');

    // OWN
    expect(service.getGWRequirementValue('OWN: custom')).toBe('custom');
    expect(reqElement.innerHTML).toBe('md:custom');

    // no_nitro
    expect(service.getGWRequirementValue('no_nitro')).toBe('no_nitro');
    expect(reqElement.innerHTML).toBe('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_NITRO:undefined');

    // default (invalid)
    expect(service.getGWRequirementValue('INVALID: 123')).toBe('');
    expect(reqElement.innerHTML).toBe('');
  });

  it('should use cached guilds from localStorage if cache is valid and no cache_btn is provided', () => {
    const mockGuilds = [{ id: '1', name: 'Guild 1' }, { id: '2', name: 'Guild 2' }];
    localStorage.setItem('guilds', JSON.stringify(mockGuilds));
    localStorage.setItem('guilds_last_updated', Date.now().toString());
    service.active_guild = null;
    service.isLoading = true;

    service.getGuilds(comService, { isAdmin: jest.fn() } as any);

    expect(service.servers).toEqual(mockGuilds);
    expect(service.isLoading).toBe(false);
  });

  it('should fetch guilds from API, filter, map, sort, and update localStorage', fakeAsync(() => {
    const mockGuilds = [
      { id: '2', name: 'B', permissions: 8, owner: false, features: ['COMMUNITY'], icon: 'icon2', approximate_member_count: 1000, approximate_presence_count: 100, image_url: undefined },
      { id: '1', name: 'A', permissions: 0, owner: true, features: ['COMMUNITY'], icon: 'icon1', approximate_member_count: 2000, approximate_presence_count: 200, image_url: undefined },
      { id: '3', name: 'C', permissions: 0, owner: false, features: [], icon: null, approximate_member_count: 3000, approximate_presence_count: 300 }
    ];
    const filteredGuilds = [
      { ...mockGuilds[1], image_url: `https://cdn.discordapp.com/icons/1/icon1.png`, approximate_member_count: '2.000', approximate_presence_count: '200' },
      { ...mockGuilds[0], image_url: `https://cdn.discordapp.com/icons/2/icon2.png`, approximate_member_count: '1.000', approximate_presence_count: '100' }
    ];
    const comServiceMock = {
      getGuilds: jest.fn().mockResolvedValue(defer(() => Promise.resolve(mockGuilds)))
    };
    const authServiceMock = {
      isAdmin: jest.fn((perm) => perm === 8)
    };
    service.active_guild = null;
    service.isLoading = true;
    service.isFetching = false;
    localStorage.removeItem('guilds');

    service.getGuilds(comServiceMock as any, authServiceMock as any);
    tick()

    expect(comServiceMock.getGuilds).toHaveBeenCalled();
    expect(service.servers).toEqual(filteredGuilds.sort((a, b) => a.name.localeCompare(b.name)));
    expect(localStorage.getItem('guilds')).toBe(JSON.stringify(service.servers));
    expect(localStorage.getItem('guilds_last_updated')).toBeDefined();
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
  }));

  it('should set isLoading to false and re-enable cache_btn after API call if cache_btn is provided', fakeAsync(() => {
    const mockGuilds = [
      { id: '1', name: 'A', permissions: 8, owner: false, features: ['COMMUNITY'], icon: 'icon1', approximate_member_count: 100, approximate_presence_count: 10 }
    ];
    const comServiceMock = {
      getGuilds: jest.fn().mockResolvedValue(defer(() => Promise.resolve(mockGuilds)))
    };
    const authServiceMock = {
      isAdmin: jest.fn(() => true)
    };
    const cache_btn = document.createElement('button');
    cache_btn.disabled = false;
    service.active_guild = null;
    service.isLoading = false;

    service.getGuilds(comServiceMock as any, authServiceMock as any, cache_btn);

    expect(service.isLoading).toBe(true);
    expect(cache_btn.disabled).toBe(true);

    tick();

    expect(service.isLoading).toBe(false);
    // Simulate timeout for re-enabling button
    tick(10000);
    expect(cache_btn.disabled).toBe(false);
  }));

  it('should call getGuilds api and guild icon should be gif with cache_btn set', fakeAsync(() => {
    const mockGuilds = [
      { id: '1', name: 'A', permissions: 8, owner: false, features: ['COMMUNITY'], icon: 'a_icon',
        approximate_member_count: 100, approximate_presence_count: 10 }
    ];
    const comServiceMock = {
      getGuilds: jest.fn().mockResolvedValue(defer(() => Promise.resolve(mockGuilds)))
    };
    const authServiceMock = { isAdmin: jest.fn(() => true) };
    service.active_guild = { id: '1', name: 'A' } as Guild;
    document.body.innerHTML = '<button id="cache_btn" disabled></button>';
    const cache_btn = document.getElementById('cache_btn') as HTMLButtonElement;
    service.isLoading = false;

    service.getGuilds(comServiceMock as any, authServiceMock as any, cache_btn);

    expect(service.isLoading).toBe(true);
    expect(cache_btn.disabled).toBe(true);

    tick();

    expect(service.isLoading).toBe(false);
    tick(10000);
    expect(cache_btn.disabled).toBe(false);
  }));

  it('should call redirectLoginError with REQUESTS on 429 error', fakeAsync(() => {
    const comServiceMock = {
      getGuilds: jest.fn().mockResolvedValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))))
    };
    const authServiceMock = { isAdmin: jest.fn() };
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});
    service.isFetching = true;
    service.isLoading = true;

    localStorage.removeItem('guilds');
    service.getGuilds(comServiceMock as any, authServiceMock as any);

    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(service.isFetching).toBe(false);
  }));

  it('should call redirectLoginError with EXPIRED on non-401/429 error', fakeAsync(() => {
    const comServiceMock = {
      getGuilds: jest.fn().mockResolvedValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))))
    };
    const authServiceMock = { isAdmin: jest.fn() };
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});
    service.isFetching = true;
    service.isLoading = true;
    document.body.innerHTML = '<button id="cache_btn" disabled></button>';
    const cache_btn = document.getElementById('cache_btn') as HTMLButtonElement;

    service.getGuilds(comServiceMock as any, authServiceMock as any, cache_btn);
    tick(10001);

    expect(redirectSpy).toHaveBeenCalledWith('EXPIRED');
    expect(service.isFetching).toBe(false);
    expect(cache_btn.disabled).toBe(false);
  }));

  it('should do nothing on 401 error and set isFetching to false', fakeAsync(() => {
    const comServiceMock = {
      getGuilds: jest.fn().mockResolvedValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 401 }))))
    };
    const authServiceMock = { isAdmin: jest.fn() };
    const redirectSpy = jest.spyOn(service, 'redirectLoginError');
    service.isFetching = true;
    service.isLoading = true;

    service.getGuilds(comServiceMock as any, authServiceMock as any);
    tick();

    expect(redirectSpy).not.toHaveBeenCalled();
    expect(service.isFetching).toBe(false);
  }));

  it('should set isLoading to false and re-enable cache_btn on error if cache_btn is provided', fakeAsync(() => {
    const comServiceMock = {
      getGuilds: jest.fn().mockResolvedValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))))
    };
    const authServiceMock = { isAdmin: jest.fn() };
    const cache_btn = document.createElement('button');
    cache_btn.disabled = false;
    service.isFetching = true;
    service.isLoading = true;
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});

    service.getGuilds(comServiceMock as any, authServiceMock as any, cache_btn);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('EXPIRED');
    expect(service.isLoading).toBe(false);
    tick(10001);
    expect(cache_btn.disabled).toBe(false);
  }));

  it('should return early if active_guild is not set', () => {
    service.active_guild = null;
    service.isFetching = false;
    service.getGuildChannels(comService, false);
    expect(service.isFetching).toBe(false);
  });

  it('should use cached channels from localStorage if cache is valid and no_cache is false', () => {
    service.active_guild = { id: 'guild1' } as Guild;
    const mockChannels = [{ id: 'channel1', type: 0 }, { id: 'channel2', type: 0 }] as Channel[];
    jest.spyOn(service, 'getGuildChannels');

    localStorage.setItem('guild_channels', JSON.stringify(mockChannels));
    localStorage.setItem('guild_channels_type', 'TEXT');
    localStorage.setItem('guild_channels_timestamp', Date.now().toString());

    service.getGuildChannels(comService, false, true, 'TEXT');

    expect(service.guild_channels).toEqual(mockChannels);
    expect(service.isFetching).toBe(false);

    // recursive function call if wish_type different
    service.getGuildChannels(comService, false, true, 'FORUM');
    expect(service.getGuildChannels).toHaveBeenCalledTimes(3);
  });

  it('should fetch channels from API if cache is invalid', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    const mockChannels = [{ id: 'channel1', type: 0 }, { id: 'channel2', type: 0 }] as Channel[];

    localStorage.setItem('guild_channels_timestamp', (Date.now() - 400000).toString());  // Set expired cache
    jest.spyOn(comService, 'getGuildChannels').mockResolvedValue(defer(() => Promise.resolve(mockChannels)));

    // text channel type
    service.getGuildChannels(comService, false, true, 'TEXT');
    tick();

    expect(comService.getGuildChannels).toHaveBeenCalledWith('guild1');
    expect(service.guild_channels).toEqual(mockChannels);
    expect(service.isFetching).toBe(false);

    // forum channel type
    service.getGuildChannels(comService, true, true, 'FORUM');
    tick();

    expect(comService.getGuildChannels).toHaveBeenCalledWith('guild1');
    expect(service.guild_channels).not.toEqual(mockChannels);
    expect(service.isFetching).toBe(false);

    // other channel type
    service.getGuildChannels(comService, true, true, 'OTHER');
    tick();

    expect(comService.getGuildChannels).toHaveBeenCalledWith('guild1');
    expect(service.guild_channels).not.toEqual(mockChannels);
    expect(service.isFetching).toBe(false);
  }));

  it('should fetch channels from API if no_cache is true regardless of cache validity', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    const mockChannels = [{ id: 'channel1' }, { id: 'channel2' }] as Channel[];

    // Set valid cache
    localStorage.setItem('guild_channels', JSON.stringify([{ id: 'old' }]));
    localStorage.setItem('guild_channels_timestamp', Date.now().toString());

    jest.spyOn(comService, 'getGuildChannels').mockResolvedValue(defer(() => Promise.resolve(mockChannels)));

    service.getGuildChannels(comService, true);
    tick();

    expect(comService.getGuildChannels).toHaveBeenCalledWith('guild1');
    expect(service.guild_channels).toEqual(mockChannels);
    expect(service.isFetching).toBe(false);
  }));

  it('should handle API errors correctly', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    const errorResponse = new HttpErrorResponse({ status: 500 });

    jest.spyOn(comService, 'getGuildChannels').mockResolvedValue(defer(() => Promise.reject(errorResponse)));
    jest.spyOn(service, 'handleApiError').mockImplementation(() => {});

    service.getGuildChannels(comService, true);
    tick();

    expect(service.handleApiError).toHaveBeenCalledWith(errorResponse);
  }));



  ///////////////////////////////////////////


  it('should return early if active_guild is not set (guild roles)', () => {
    service.active_guild = null;
    service.isFetching = false;
    service.getGuildRoles(comService, false);
    expect(service.isFetching).toBe(false);
  });

  it('should use cached roles from localStorage if cache is valid and no_cache is false', () => {
    service.active_guild = { id: 'guild1' } as Guild;
    const mockRoles = [{ id: 'role1' }, { id: 'role2' }] as Role[];

    localStorage.setItem('guild_roles', JSON.stringify(mockRoles));
    localStorage.setItem('guild_roles_timestamp', Date.now().toString());

    service.getGuildRoles(comService);

    expect(service.guild_roles).toEqual(mockRoles);
    expect(service.isFetching).toBe(false);
  });

  it('should fetch roles from API if cache is invalid', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    service.isFetching = false;
    const mockRoles = [{ id: 'role1' }, { id: 'role2' }] as Role[];

    localStorage.setItem('guild_roles', JSON.stringify(mockRoles));
    localStorage.setItem('guild_roles_timestamp', (Date.now() - 1200000).toString());  // Set expired cache
    jest.spyOn(comService, 'getGuildRoles').mockResolvedValue(defer(() => Promise.resolve(mockRoles)));

    service.getGuildRoles(comService, true);
    tick();

    expect(comService.getGuildRoles).toHaveBeenCalledWith('guild1');
    expect(service.guild_roles).toEqual(mockRoles);
    expect(service.isFetching).toBe(false);
  }));

  it('should not fetch roles from API use cache instead', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    const mockRoles = [{ id: 'role1' }, { id: 'role2' }] as Role[];

    // Set valid cache
    localStorage.setItem('guild_roles', JSON.stringify(mockRoles));
    localStorage.setItem('guild_roles_timestamp', Date.now().toString());

    service.getGuildRoles(comService, true);
    tick();

    expect(service.guild_roles).toEqual(mockRoles);
    expect(service.isFetching).toBe(false);
  }));

  it('should handle API errors correctly', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    service.isFetching = false;
    const errorResponse = new HttpErrorResponse({ status: 500 });


    jest.spyOn(comService, 'getGuildRoles').mockResolvedValue(defer(() => Promise.reject(errorResponse)));
    jest.spyOn(service, 'handleApiError').mockImplementation(() => {});

    service.getGuildRoles(comService, true, true);
    tick();

    expect(service.handleApiError).toHaveBeenCalledWith(errorResponse);
  }));

  it('should use cached config if available and not expired', fakeAsync(() => {
    const mockConfig = { color_code: 16777215, thumbnail_url: 'url', banner_url: null, emoji_reaction: ':test:' };
    localStorage.setItem('gift_config', JSON.stringify(mockConfig));
    localStorage.setItem('guild_vip', true.toString());
    localStorage.setItem('gift_config_timestamp', Date.now().toString());
    service.active_guild = { id: 'guild1' } as Guild;

    jest.spyOn(service, 'getGuildEmojis').mockImplementation(() => {});

    service.getEventConfig(apiService, comService, false);
    tick(150);

    mockConfig.color_code = '#ffffff' as any; // Convert to hex format
    expect(service.embed_config).toEqual(mockConfig);
    expect(service.isLoading).toBe(false);
    expect(service.getGuildEmojis).toHaveBeenCalledWith(comService, false);
  }));

  it('should fetch config from API if cache is expired or no_cache is true', fakeAsync(() => {
    localStorage.setItem('gift_config', JSON.stringify({}));
    localStorage.setItem('gift_config_timestamp', (Date.now() - 31000).toString());
    const mockConfig = { color_code: 16777215, thumbnail_url: 'url2', banner_url: null, emoji_reaction: ':api:' };
    let rawConfig = { config: mockConfig, has_vip: true } as EmbedConfigRaw;
    service.active_guild = { id: 'guild1' } as Guild;
    const apiSpy = jest.spyOn(apiService, 'getEventConfig').mockReturnValue(defer(() => Promise.resolve(rawConfig)));
    jest.spyOn(service, 'getGuildEmojis').mockImplementation(() => {});

    service.getEventConfig(apiService, comService, false);
    tick(550);

    mockConfig.color_code = '#ffffff' as any; // Convert to hex format
    expect(apiSpy).toHaveBeenCalledWith('guild1');
    expect(service.embed_config).toEqual(mockConfig);
    expect(service.isLoading).toBe(false);
    expect(service.getGuildEmojis).toHaveBeenCalledWith(comService, false);
    expect(localStorage.getItem('gift_config')).toEqual(JSON.stringify(mockConfig));

    // check branch for false if not response.has_vip
    rawConfig = { config: mockConfig } as EmbedConfigRaw;
    service.getEventConfig(apiService, comService, true);
    tick(550);

    expect(service.has_vip).toBe(false);

  }));

  it('should handle API error 429 and call redirectLoginError with REQUESTS', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(apiService, 'getEventConfig').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))));
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});

    service.getEventConfig(apiService, comService, true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(service.isLoading).toBe(false);
  }));

  it('should handle API error 0 and call redirectLoginError with OFFLINE', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(apiService, 'getEventConfig').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 0 }))));
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});

    service.getEventConfig(apiService, comService, true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
    expect(service.isLoading).toBe(false);
  }));

  it('should handle unknown API error and call redirectLoginError with UNKNOWN', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(apiService, 'getEventConfig').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});

    service.getEventConfig(apiService, comService, true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(service.isLoading).toBe(false);
  }));

  it('should return if no active guild', () => {
    jest.spyOn(comService, 'getGuildEmojis');
    service.active_guild = null;
    service.getEventConfig(apiService, comService, true);
    expect(comService['getGuildEmojis']).not.toHaveBeenCalled();
  });

  it('should return if no active guild (guild emojis)', fakeAsync(() => {
    jest.spyOn(comService, 'getGuildEmojis');
    service.active_guild = null;
    service.guild_emojis = [];

    service.getGuildEmojis(comService, true);
    tick();

    expect(comService['getGuildEmojis']).not.toHaveBeenCalled();
    expect(service.guild_emojis).toEqual([]);
  }));

  it('should use cache if available and not expired', fakeAsync(() => {
    const emojis = [{ id: '1', animated: false, available: true, managed: false, require_colons: true }] as Emoji[];
    service.active_guild = { id: 'guild1' } as Guild;
    localStorage.setItem('guild_emojis', JSON.stringify(emojis));
    localStorage.setItem('support_themes_timestamp', (Date.now()).toString());
    jest.spyOn(comService, 'getGuildEmojis').mockResolvedValue(defer(() => Promise.resolve(emojis)));
    service.isEmojisLoading = true;

    service.getGuildEmojis(comService);
    tick();

    expect(service.guild_emojis).toEqual(emojis);
    expect(service.isEmojisLoading).toBe(false);
  }));

  it('should use initEmojis if cache is empty array', () => {
    localStorage.setItem('guild_emojis', JSON.stringify([]));
    localStorage.setItem('support_themes_timestamp', (Date.now()).toString());
    service.active_guild = { id: 'guild1' } as Guild;

    service.getGuildEmojis(comService);

    expect(service.guild_emojis).toEqual(initEmojis);
    expect(service.isLoading).toBe(false);
  });

  it('should fetch from API if no cache or cache expired', fakeAsync(() => {
    const mockEmoji = [{id: '2', name: 'wink'}] as unknown as Emoji[];
    jest.spyOn(comService, 'getGuildEmojis').mockResolvedValue(defer(() => Promise.resolve(mockEmoji)));
    service.active_guild = { id: 'guild1' } as Guild;
    service.getGuildEmojis(comService, true);
    tick();

    expect(comService.getGuildEmojis).toHaveBeenCalledWith('guild1');
    expect(service.guild_emojis).toEqual([{ id: '2', name: 'wink' }]);
    expect(localStorage.getItem('guild_emojis')).toBe(JSON.stringify([{ id: '2', name: 'wink' }]));
  }));


  it('should use initEmojis if api fetch is empty array', fakeAsync(() => {
    const mockEmoji = [] as unknown as Emoji[];
    jest.spyOn(comService, 'getGuildEmojis').mockResolvedValue(defer(() => Promise.resolve(mockEmoji)));
    service.active_guild = { id: 'guild1' } as Guild;

    service.getGuildEmojis(comService, true);
    tick();

    expect(service.guild_emojis).toEqual(initEmojis);
    expect(localStorage.getItem('guild_emojis')).toBe(JSON.stringify(initEmojis));
    expect(service.isEmojisLoading).toBe(false);
  }));

  it('should handle API error 429 by calling redirectLoginError with REQUESTS', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(comService, 'getGuildEmojis').mockResolvedValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))));
    jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});

    service.getGuildEmojis(comService, true);
    tick();

    expect(service.redirectLoginError).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle API error 401 by calling redirectLoginError with NO_CLANK', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(comService, 'getGuildEmojis').mockResolvedValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 401 }))));
    jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});

    service.getGuildEmojis(comService, true);
    tick();

    expect(service.redirectLoginError).toHaveBeenCalledWith('NO_CLANK');
  }));

  it('should handle API error other by calling redirectLoginError with EXPIRED', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(comService, 'getGuildEmojis').mockResolvedValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});

    service.getGuildEmojis(comService, true);
    tick();

    expect(service.redirectLoginError).toHaveBeenCalledWith('EXPIRED');
  }));

  it('should correctly identify text channels', () => {
    const textChannel = { id: '1', name: 'test-channel', type: 0 } as Channel;
    const nonTextChannel1 = { id: '2', name: 'voice-channel', type: 2 } as Channel;
    const nonTextChannel2 = { id: '3', name: 'stage-channel', type: 13 } as Channel;
    const invalidChannel = { id: '4', name: 'broken' } as unknown as Channel;

    expect(service.isTextChannel(textChannel)).toBe(true);
    expect(service.isTextChannel(nonTextChannel1)).toBe(false);
    expect(service.isTextChannel(nonTextChannel2)).toBe(false);
    expect(service.isTextChannel(invalidChannel)).toBe(false);
  });

  it('should correctly identify voice channels', () => {
    const voiceChannel = { id: '1', name: 'voice-channel', type: 2 } as Channel;
    const stageChannel = { id: '2', name: 'stage-channel', type: 13 } as Channel;
    const nonVoiceChannel = { id: '3', name: 'text-channel', type: 0 } as Channel;
    const invalidChannel = { id: '4', name: 'broken' } as unknown as Channel;
    const alternativeVoiceChannel = {id: '5', name: 'alternative-voice', channel_type: 'voice'} as unknown as Channel;

    expect(service.isVoiceChannel(voiceChannel)).toBe(true);
    expect(service.isVoiceChannel(stageChannel)).toBe(true);
    expect(service.isVoiceChannel(alternativeVoiceChannel)).toBe(true);
    expect(service.isVoiceChannel(nonVoiceChannel)).toBe(false);
    expect(service.isVoiceChannel(invalidChannel)).toBe(false);
  });

  it('should return early if no active_guild', () => {
    service.active_guild = null;
    service.isFetching = false;
    service.getSecurityLogs(apiService, false, false);
    expect(service.isFetching).toBe(false);
  });

  it('should use cached security_logs if cache is valid and no_cache is false, and call getUnbanRequests if check_unban is true', fakeAsync(() => {
    const mockLogs = { test: 'log' };
    localStorage.setItem('security_logs', JSON.stringify(mockLogs));
    localStorage.setItem('security_logs_type', 'DEFAULT');
    localStorage.setItem('security_logs_timestamp', Date.now().toString());
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(service, 'getUnbanRequests').mockImplementation(() => {});
    service.isLoading = true;
    service.isFetching = true;

    service.getSecurityLogs(apiService, true, false);
    tick(101);

    expect(service.security_logs).toEqual(mockLogs);
    expect(service.getUnbanRequests).toHaveBeenCalledWith(apiService, false);
    expect(service.isLoading).toBe(true);
    expect(service.isFetching).toBe(true);

    // test isLoading & isFetching branch
    service.getSecurityLogs(apiService, false, false);
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
  }));

  it('should use cached security_logs if cache is valid and no_cache is false, and not call getUnbanRequests if check_unban is false', () => {
    const mockLogs = { test: 'log' };
    localStorage.setItem('security_logs', JSON.stringify(mockLogs));
    localStorage.setItem('security_logs_type', 'PENDING');
    localStorage.setItem('security_logs_timestamp', Date.now().toString());
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(service, 'getUnbanRequests').mockImplementation(() => {});
    service.isLoading = true;
    service.isFetching = true;

    jest.spyOn(service, 'getSecurityLogs');

    service.getSecurityLogs(apiService, false, false);

    expect(service.getSecurityLogs).toHaveBeenCalledWith(apiService, false, true);
  });

  it('should fetch security_logs from API if cache is invalid and call getUnbanRequests if check_unban is true', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    const mockLogs = { test: 'api-log' } as unknown as SecurityLogs;
    localStorage.setItem('security_logs_timestamp', (Date.now() - 31000).toString());
    const apiSpy = jest.spyOn(apiService, 'getSecurityLogs').mockReturnValue(defer(() => Promise.resolve(mockLogs)));
    jest.spyOn(service, 'getUnbanRequests').mockImplementation(() => {});
    service.isLoading = true;
    service.isFetching = true;

    service.getSecurityLogs(apiService, true, true);
    tick(551);

    expect(apiSpy).toHaveBeenCalledWith('guild1');
    expect(service.security_logs).toEqual(mockLogs);
    expect(service.getUnbanRequests).toHaveBeenCalledWith(apiService, true);
    expect(localStorage.getItem('security_logs')).toEqual(JSON.stringify(mockLogs));
    expect(localStorage.getItem('security_logs_timestamp')).toBeDefined();
  }));

  it('should fetch security_logs from API if cache is invalid and set isLoading/isFetching to false if check_unban is false', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    const mockLogs = {test: 'api-log'} as unknown as SecurityLogs;
    localStorage.setItem('security_logs_timestamp', (Date.now() - 31000).toString());
    const apiSpy = jest.spyOn(apiService, 'getSecurityLogs').mockReturnValue(defer(() => Promise.resolve(mockLogs)));
    jest.spyOn(service, 'getUnbanRequests').mockImplementation(() => {});
    service.isLoading = true;
    service.isFetching = true;

    service.getSecurityLogs(apiService, false, true);
    tick();

    expect(apiSpy).toHaveBeenCalledWith('guild1');
    expect(service.security_logs).toEqual(mockLogs);
    expect(service.getUnbanRequests).not.toHaveBeenCalled();
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
    expect(localStorage.getItem('security_logs')).toEqual(JSON.stringify(mockLogs));
    expect(localStorage.getItem('security_logs_timestamp')).toBeDefined();
  }));

  it('should handle API error 429 and call redirectLoginError with REQUESTS', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(apiService, 'getSecurityLogs').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))));
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});
    service.isLoading = true;
    service.isFetching = true;

    service.getSecurityLogs(apiService, false, true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
  }));

  it('should handle API error 0 and call redirectLoginError with OFFLINE', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(apiService, 'getSecurityLogs').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 0 }))));
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});
    service.isLoading = true;
    service.isFetching = true;

    service.getSecurityLogs(apiService, false, true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
  }));

  it('should handle unknown API error and call redirectLoginError with UNKNOWN', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(apiService, 'getSecurityLogs').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});
    service.isLoading = true;
    service.isFetching = true;

    service.getSecurityLogs(apiService, false, true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
  }));

  it('should return early if no active_guild is set', () => {
    service.active_guild = null;
    service.unban_requests = [];
    service.filteredRequests = [];
    service.isLoading = true;
    service.isFetching = true;

    service.getUnbanRequests(apiService, false);

    expect(service.unban_requests).toEqual([]);
    expect(service.filteredRequests).toEqual([]);
    expect(service.isLoading).toBe(true);
    expect(service.isFetching).toBe(true);
  });

  it('should use cache if available and not expired, and set loading/fetching to false', () => {
    const mockRequests = [{id: '1'}, {id: '2'}] as unknown as UnbanRequest[];
    localStorage.setItem('unban_requests', JSON.stringify(mockRequests));
    localStorage.setItem('unban_requests_timestamp', Date.now().toString());
    service.active_guild = { id: 'guild1' } as Guild;
    service.isLoading = true;
    service.isFetching = true;

    service.getUnbanRequests(apiService, false);

    expect(service.unban_requests).toEqual(mockRequests);
    expect(service.filteredRequests).toEqual(mockRequests);
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
  });

  it('should fetch from API if cache is expired and update state and cache', fakeAsync(() => {
    const mockRequests = [{id: '3'}] as unknown as UnbanRequest[];
    localStorage.setItem('unban_requests', JSON.stringify([{ id: 'old' }]));
    localStorage.setItem('unban_requests_timestamp', (Date.now() - 16000).toString());
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(apiService, 'getUnbanRequests').mockReturnValue(defer(() => Promise.resolve(mockRequests)));

    service.getUnbanRequests(apiService, false);
    tick();

    expect(apiService.getUnbanRequests).toHaveBeenCalledWith('guild1');
    expect(service.unban_requests).toEqual(mockRequests);
    expect(service.filteredRequests).toEqual(mockRequests);
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
    expect(localStorage.getItem('unban_requests')).toBe(JSON.stringify(mockRequests));
    expect(localStorage.getItem('unban_requests_timestamp')).toBeDefined();
  }));

  it('should fetch from API if no_cache is true, even if cache is valid', fakeAsync(() => {
    const mockRequests = [{id: '4'}] as unknown as UnbanRequest[];
    localStorage.setItem('unban_requests', JSON.stringify([{ id: 'old' }]));
    localStorage.setItem('unban_requests_timestamp', Date.now().toString());
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(apiService, 'getUnbanRequests').mockReturnValue(defer(() => Promise.resolve(mockRequests)));

    service.getUnbanRequests(apiService, true);
    tick();

    expect(apiService.getUnbanRequests).toHaveBeenCalledWith('guild1');
    expect(service.unban_requests).toEqual(mockRequests);
    expect(service.filteredRequests).toEqual(mockRequests);
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
    expect(localStorage.getItem('unban_requests')).toBe(JSON.stringify(mockRequests));
  }));

  it('should handle API error 429 and call redirectLoginError with REQUESTS', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(apiService, 'getUnbanRequests').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))));
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});
    service.isLoading = true;
    service.isFetching = true;

    service.getUnbanRequests(apiService, true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
  }));

  it('should handle API error 0 and call redirectLoginError with OFFLINE', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(apiService, 'getUnbanRequests').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 0 }))));
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});
    service.isLoading = true;
    service.isFetching = true;

    service.getUnbanRequests(apiService, true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
  }));

  it('should handle unknown API error and call redirectLoginError with UNKNOWN', fakeAsync(() => {
    service.active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(apiService, 'getUnbanRequests').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    const redirectSpy = jest.spyOn(service, 'redirectLoginError').mockImplementation(() => {});
    service.isLoading = true;
    service.isFetching = true;

    service.getUnbanRequests(apiService, true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(service.isLoading).toBe(false);
    expect(service.isFetching).toBe(false);
  }));

});
