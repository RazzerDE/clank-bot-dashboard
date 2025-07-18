import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {TasksCompletionList} from "../types/Tasks";
import {AuthService} from "../auth/auth.service";
import { HttpHeaders, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {SliderItems} from "../types/landing-page/SliderItems";
import {formGroupBug, formGroupIdea} from "../types/Forms";
import {FeatureData, FeatureVotes} from "../types/navigation/WishlistTags";
import {SupportSetup} from "../types/discord/Guilds";
import {SupportTheme, TicketAnnouncement, TicketSnippet} from "../types/Tickets";
import {GeneralStats} from "../types/Statistics";
import {BlockedUser} from "../types/discord/User";
import {EventEffects, EventEffectsRaw, Giveaway} from "../types/Events";
import {EmbedConfig} from "../types/Config";

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot()],
    providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: AuthService, useValue: { headers: new HttpHeaders({ 'Authorization': 'Bearer token' }) } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch general statistics about the clank bot', () => {
    const mockResponse: GeneralStats = {
      user_count: 1000,
      guild_count: 500,
      giveaway_count: 200,
      ticket_count: 300,
      punish_count: 150,
      global_verified_count: 50
    };

    service.getGeneralStats().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/stats/general`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it("should fetch guild usage statistics", () => {
    const mockResponse: SliderItems[] = [];

    service.getGuildUsage(10).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/stats/guilds_usage?limit=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    // test without limit
    service.getGuildUsage(0).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    })

    const reqWithoutLimit = httpMock.expectOne(`${service['API_URL']}/stats/guilds_usage`);
    expect(reqWithoutLimit.request.method).toBe('GET');
    reqWithoutLimit.flush(mockResponse);
  });

  it('should fetch feature votes successfully', () => {
    const mockResponse: FeatureVotes = { feature_1: { votes: 10, userVote: true } } as unknown as FeatureVotes;
    service['authService'].headers = new HttpHeaders({ 'Authorization': 'Bearer token' });

    service.getFeatureVotes().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/progress/features`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch module status for a specific guild', () => {
    const guildId = '12345';
    const mockResponse: TasksCompletionList = {};

    service.getModuleStatus(guildId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/progress/modules?guild_id=${guildId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch blocked users for a specific guild', () => {
    const guild_id = '12345';
    const mockResponse: BlockedUser[] = [{username: 'User1'}, {username: 'User2'}] as unknown as BlockedUser[];

    service.getBlockedUsers(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/blocked-users?guild_id=${guild_id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should add a blocked user to a specific guild', () => {
    const guild_id = '12345';
    const blockedUser: BlockedUser = {username: 'User1'} as unknown as BlockedUser;
    const mockResponse: BlockedUser = {username: 'User1'} as unknown as BlockedUser;

    service.addBlockedUser(guild_id, blockedUser).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/blocked-users?guild_id=${guild_id}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(blockedUser);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should delete a blocked user for a specific guild', () => {
    const guild_id = '12345';
    const user_id = '67890';
    const mockResponse = { success: true };

    service.deleteBlockedUser(guild_id, user_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/blocked-users?guild_id=${guild_id}&user_id=${user_id}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should return cached module status if cache is valid', () => {
    const guildId = '12345';
    const mockModuleStatus: TasksCompletionList = { task_1: { guild_id: guildId,  finished: false,  subtasks: [] } };
    const timestamp = Date.now().toString();

    localStorage.setItem('moduleStatusTimestamp', timestamp);
    localStorage.setItem('moduleStatus', JSON.stringify(mockModuleStatus));

    service.getModuleStatus(guildId).subscribe((response) => {
      expect(response).toEqual({ task_1: { guild_id: guildId, cached: true } });
    });

    localStorage.removeItem('moduleStatusTimestamp');
    localStorage.removeItem('moduleStatus');
  });

  it('should fetch module status from API if cache is expired', () => {
    const guildId = '12345';
    const mockModuleStatus: TasksCompletionList = { task_1: { guild_id: guildId,  finished: false,  subtasks: [] } };
    const expiredTimestamp = (Date.now() - 70000).toString();

    localStorage.setItem('moduleStatusTimestamp', expiredTimestamp);
    localStorage.setItem('moduleStatus', JSON.stringify(mockModuleStatus));

    service.getModuleStatus(guildId).subscribe((response) => {
      expect(response).toEqual(mockModuleStatus);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/progress/modules?guild_id=${guildId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockModuleStatus);

    localStorage.removeItem('moduleStatusTimestamp');
    localStorage.removeItem('moduleStatus');
  });

  it('should handle errors when reading from cache', () => {
    const guildId = '12345';
    const invalidModuleStatus = "{ invalid JSON }";
    const expiredTimestamp = (Date.now() - 70000).toString();

    localStorage.setItem('moduleStatusTimestamp', expiredTimestamp);
    localStorage.setItem('moduleStatus', invalidModuleStatus);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    service.getModuleStatus(guildId).subscribe((response) => {
      expect(response).toEqual({ task_1: { guild_id: guildId, finished: false, subtasks: [] } });
    });

    const req = httpMock.expectOne(`${service['API_URL']}/progress/modules?guild_id=${guildId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush({ task_1: { guild_id: guildId, finished: false, subtasks: [] } });

    expect(consoleSpy).toHaveBeenCalledWith('Cache reading error:', expect.any(SyntaxError));

    localStorage.removeItem('moduleStatusTimestamp');
    localStorage.removeItem('moduleStatus');
    consoleSpy.mockRestore();
  });

  it('should fetch module status from API if cache is not present', () => {
    const guildId = '12345';
    const mockModuleStatus: TasksCompletionList = { task_1: { guild_id: guildId,  finished: false,  subtasks: [] } };

    service.getModuleStatus(guildId).subscribe((response) => {
      expect(response).toEqual(mockModuleStatus);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/progress/modules?guild_id=${guildId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockModuleStatus);
  });

  it('should send a feature vote to the server', () => {
    const mockData: FeatureData = { user_id: "123", feature_id: 123, vote: true };
    const mockResponse = { success: true };

    service.sendFeatureVote(mockData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/progress/features`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should send an idea suggestion to the server', () => {
    const mockData: formGroupIdea = { ideaTitle: 'Test', ideaDescription: 'Test', ideaCategory: 'test',
      profile: {id: 123, username: 'test'} } as unknown as formGroupIdea;
    const mockResponse = { success: true };

    service.sendIdeaSuggestion(mockData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/contact/idea`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should send an bug-report to the server', () => {
    const mockData: formGroupBug = { bugName: '123', bugSteps: 'test', bugExpected: '456', bugActual: '567',
      profile: {id: 123, username: 'test'} } as unknown as formGroupBug;
    const mockResponse = { success: true };

    service.sendBugReport(mockData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/contact/bug`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch support setup status for a specific guild', () => {
    const guild_id = '12345';
    const mockResponse: SupportSetup = {
      support_forum: { id: '1', name: 'Support Forum' },
      support_forum_pending: true,
      discord_channels: [
        { id: '2', name: 'General' },
        { id: '3', name: 'Help' }
      ]
    } as SupportSetup;

    service.getSupportSetupStatus(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/support-setup?guild_id=${guild_id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch ticket snippets for a specific guild', () => {
    const guild_id = '12345';
    const mockResponse: TicketSnippet[] = [
      { guild_id, name: 'Snippet1', desc: 'Description1' },
      { guild_id, name: 'Snippet2', desc: 'Description2' }
    ];

    service.getSnippets(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/support-snippets?guild_id=${guild_id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should create a new ticket snippet for a specific guild', () => {
    const snippet: TicketSnippet = { guild_id: '12345', name: 'Snippet1', desc: 'Description1' };
    const mockResponse = { success: true };

    service.createSnippet(snippet).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/support-snippets?guild_id=${snippet.guild_id}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(snippet);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should edit an existing ticket snippet for a specific guild', () => {
    const snippet: TicketSnippet = { guild_id: '12345', name: 'Snippet1', old_name: 'OldSnippet', desc: 'Updated Description' };
    const mockResponse = { success: true };

    service.editSnippet(snippet).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/support-snippets?guild_id=${snippet.guild_id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(snippet);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should delete an existing ticket snippet for a specific guild', () => {
    const snippet: TicketSnippet = { guild_id: '12345', name: 'Snippet1', desc: 'Description1' };
    const mockResponse = { success: true };

    service.deleteSnippet(snippet).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${service['API_URL']}/guilds/support-snippets?guild_id=${snippet.guild_id}&name=${encodeURIComponent(snippet.name)}`
    );
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch the current ticket announcement for a specific guild', () => {
    const guild_id = '12345';
    const mockResponse: TicketAnnouncement = {
      level: 1,
      description: 'Test Announcement',
      end_date: '2023-12-31'
    };

    service.getTicketAnnouncement(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/support-announcement?guild_id=${guild_id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should set a new ticket announcement for a specific guild', () => {
    const guild_id = '12345';
    const announcement: TicketAnnouncement = {
      level: 2,
      description: 'New Announcement',
      end_date: '2024-01-01'
    };
    const mockResponse = { success: true };

    service.setAnnouncement(announcement, guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/support-announcement?guild_id=${guild_id}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(announcement);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should delete the current ticket announcement for a specific guild', () => {
    const guild_id = '12345';
    const mockResponse = { success: true };

    service.deleteAnnouncement(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/support-announcement?guild_id=${guild_id}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should create a support theme for a specific guild', () => {
    const theme: SupportTheme = { name: 'TestTheme' } as SupportTheme;
    const guild_id = 'guild123';
    const mockResponse = { success: true };

    service.createSupportTheme(theme, guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/support-themes?guild_id=${guild_id}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(theme);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should edit a support theme for a specific guild', () => {
    const theme: SupportTheme = { name: 'TestTheme' } as SupportTheme;
    const guild_id = 'guild123';
    const mockResponse = { success: true };

    service.editSupportTheme(theme, guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/support-themes?guild_id=${guild_id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(theme);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should delete a support theme using old_name if present and different from name', () => {
    const theme: SupportTheme = { name: 'TestTheme', old_name: 'OldTheme' } as SupportTheme;
    const guild_id = 'guild123';
    const mockResponse = { success: true };

    service.deleteSupportTheme(theme, guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${service['API_URL']}/guilds/support-themes?guild_id=${guild_id}&theme_name=${encodeURIComponent('OldTheme')}`
    );
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should delete a support theme using name if old_name is not present', () => {
    const theme: SupportTheme = { name: 'TestTheme' } as SupportTheme;
    const guild_id = 'guild123';
    const mockResponse = { success: true };

    service.deleteSupportTheme(theme, guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${service['API_URL']}/guilds/support-themes?guild_id=${guild_id}&theme_name=${encodeURIComponent('TestTheme')}`
    );
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should delete a support theme using name if old_name equals name', () => {
    const theme: SupportTheme = { name: 'TestTheme', old_name: 'TestTheme' } as SupportTheme;
    const guild_id = 'guild123';
    const mockResponse = { success: true };

    service.deleteSupportTheme(theme, guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${service['API_URL']}/guilds/support-themes?guild_id=${guild_id}&theme_name=${encodeURIComponent('TestTheme')}`
    );
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch all events for a specific guild', () => {
    const guild_id = '12345';
    const mockResponse: Giveaway[] = [
      { guild_id, event_id: '1', title: 'Event 1' },
      { guild_id, event_id: '2', title: 'Event 2' }
    ] as unknown as Giveaway[];

    service.getGuildEvents(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/events?guild_id=${guild_id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should save the embed config for a specific guild', () => {
    const embedConfig: EmbedConfig = { color_code: 16777215, thumbnail_url: 'https://example.com/thumbnail.png',
      banner_url: null, emoji_reaction: null } as EmbedConfig;

    const mockResponse: EmbedConfig = { ...embedConfig };

    service.saveEmbedConfig(embedConfig).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/events/config?guild_id=${embedConfig.guild_id}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(embedConfig);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch event embed configuration for a specific guild', () => {
    const guild_id = '12345';
    const mockResponse: EmbedConfig = {
      color: '#FF0000',
      thumbnail: 'https://example.com/thumbnail.png'
    } as unknown as EmbedConfig;

    service.getEventConfig(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/events/config?guild_id=${guild_id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should create a new giveaway event for a specific guild', () => {
    const giveaway: Giveaway = {
      guild_id: '12345',
      event_id: '1',
      title: 'New Event',
      description: 'Test description'
    } as unknown as Giveaway;

    const mockResponse: Giveaway = { ...giveaway };

    service.createGuildEvent(giveaway).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/events?guild_id=${giveaway.guild_id}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(giveaway);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch event effects for a specific guild', () => {
    const guild_id = '12345';
    const mockResponse: EventEffectsRaw = {
      effects: [
        { id: '1', name: 'Effect 1', enabled: true },
        { id: '2', name: 'Effect 2', enabled: false }
      ]
    } as unknown as EventEffectsRaw;

    service.getEventEffects(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/events/effects?guild_id=${guild_id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should save event effects configuration for a specific guild', () => {
    const guild_id = '12345';
    const effects: EventEffects = {
      effects: [
        { id: '1', name: 'Effect 1', enabled: true },
        { id: '2', name: 'Effect 2', enabled: false }
      ]
    } as unknown as EventEffects;
    const mockResponse = { success: true };

    service.saveEventEffects(effects, guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/events/effects?guild_id=${guild_id}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(effects);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should update an existing giveaway event for a specific guild', () => {
    const giveaway: Giveaway = {
      guild_id: '12345',
      event_id: '1',
      title: 'Updated Event',
      description: 'Updated description'
    } as unknown as Giveaway;

    const mockResponse: Giveaway = { ...giveaway };

    service.updateGuildEvent(giveaway).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/events?guild_id=${giveaway.guild_id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(giveaway);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should delete an existing giveaway event for a specific guild', () => {
    const giveaway: Giveaway = {
      guild_id: '12345',
      event_id: '1'
    } as unknown as Giveaway;

    const mockResponse = { success: true };

    service.deleteGuildEvent(giveaway).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/events?guild_id=${giveaway.guild_id}&event_id=${giveaway.event_id}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should start a scheduled giveaway event for a specific guild', () => {
    const giveaway: Giveaway = {
      guild_id: '12345',
      event_id: '1',
      status: 'SCHEDULED'
    } as unknown as Giveaway;

    const mockResponse: Giveaway = {
      ...giveaway,
      status: 'ACTIVE'
    } as unknown as Giveaway;

    service.startScheduledEvent(giveaway).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/events/start?guild_id=${giveaway.guild_id}&event_id=${giveaway.event_id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch the security logs configuration for a specific guild', () => {
    const guild_id = 'guild123';
    const mockResponse = { logs_enabled: true, log_channel: '1234567890' } as any;

    service.getSecurityLogs(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/security/logs?guild_id=${guild_id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch unban requests for a specific guild', () => {
    const guild_id = 'guild123';
    const mockResponse = [
      { user_id: '1', guild_id: 'guild123', status: 0 },
      { user_id: '2', guild_id: 'guild123', status: 1 }
    ] as any;

    service.getUnbanRequests(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/security/requests?guild_id=${guild_id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should update the status of an unban request for a specific guild and user', () => {
    const guild_id = 'guild123';
    const user_id = 'user456';
    const status = 1;
    const mockResponse = { success: true };

    service.updateUnbanRequest(guild_id, user_id, status).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${service['API_URL']}/guilds/security/requests?guild_id=${guild_id}&user_id=${user_id}&status=${status}`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should update the status of an unban request with status 2 (denied)', () => {
    const guild_id = 'guild123';
    const user_id = 'user456';
    const status = 2;
    const mockResponse = { success: true };

    service.updateUnbanRequest(guild_id, user_id, status).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${service['API_URL']}/guilds/security/requests?guild_id=${guild_id}&user_id=${user_id}&status=${status}`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch security shields for a specific guild', () => {
    const guild_id = 'guild123';
    const mockResponse = [
      { id: 'shield1', enabled: true },
      { id: 'shield2', enabled: false }
    ] as any;

    service.getSecurityShields(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/security/shields?guild_id=${guild_id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should save security shields configuration for a specific guild', () => {
    const guild_id = 'guild123';
    const shields = [
      { id: 'shield1', enabled: true },
      { id: 'shield2', enabled: false }
    ] as any;
    const mockResponse = { success: true };

    service.saveSecurityShields(guild_id, shields).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/security/shields?guild_id=${guild_id}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(shields);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should fetch backup data for a specific guild', () => {
    const guild_id = 'guild123';
    const mockResponse = { backup: 'data' } as any;

    service.getBackupData(guild_id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/security/backups?guild_id=${guild_id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should insert a bot action for a specific guild', () => {
    const guild_id = 'guild123';
    const action = 1;
    const mockResponse = { success: true };

    service.insertBotAction(guild_id, action).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/guilds/security/actions?guild_id=${guild_id}&action=${action}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });
});
