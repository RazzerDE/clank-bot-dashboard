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

  it("should fetch guild usage statistics", () => {
    const mockResponse: SliderItems[] = [];

    service.getGuildUsage(0).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['API_URL']}/stats/guilds_usage`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
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
});
