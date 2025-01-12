import {ComponentFixture, TestBed} from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {of, throwError} from "rxjs";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DataHolderService} from "../../services/data/data-holder.service";
import {ApiService} from "../../services/api/api.service";
import {SliderItems} from "../../services/types/landing-page/SliderItems";
import {Guild} from "../../services/discord-com/types/Guilds";
import {HttpErrorResponse} from "@angular/common/http";

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dataService: DataHolderService;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule, TranslateModule.forRoot(), BrowserAnimationsModule],
      providers: [ { provide: ActivatedRoute, useValue: { snapshot: {
        queryParams: { code: 'test_code', state: 'test_state' } },
          queryParams: of({ code: 'test_code', state: 'test_state' }) } },
        { provide: DataHolderService, useValue: { redirectLoginError: jest.fn(), allowDataFetch: of(true) } },
        { provide: ApiService, useValue: { getGuildUsage: jest.fn(), getModuleStatus: jest.fn() } }]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataHolderService);
    apiService = TestBed.inject(ApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update document title and set isLoading to false on language change', () => {
    const translateService = TestBed.inject(TranslateService);

    // Simulate language change event
    translateService.onLangChange.emit();

    // Check if document title is updated
    expect(document.title).toBe("Dashboard ~ Clank Discord-Bot");
  });

  it('should handle server data retrieval and update tasks', () => {
    const guildUsageMock: SliderItems[] = [{ image_url: '', guild_name: '', guild_invite: '', member_count: 0 }];
    const moduleStatusMock = {
      task_1: {
        finished: true,
        guild_id: '1',
        subtasks: [
          { id: '1', finished: true },
          { id: '2', finished: false }
        ]
      }
    };

    jest.spyOn(apiService, 'getGuildUsage').mockReturnValue(of(guildUsageMock));
    jest.spyOn(apiService, 'getModuleStatus').mockReturnValue(of(moduleStatusMock));
    jest.spyOn(dataService, 'redirectLoginError');

    window = Object.create(window);
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/dashboard' }, writable: true });

    dataService.active_guild = { id: '1', name: '' } as unknown as Guild;
    component.getServerData();

    expect(dataService.isLoading).toBe(false);
    expect(dataService.redirectLoginError).not.toHaveBeenCalled();
  });

  it('should handle server data retrieval error', () => {
    jest.spyOn(dataService, 'redirectLoginError');
    dataService.active_guild = { id: '1', name: '' } as unknown as Guild;

    jest.spyOn(apiService, 'getGuildUsage').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    component.getServerData();

    expect(dataService.redirectLoginError).toHaveBeenCalledWith('FORBIDDEN');

    jest.spyOn(apiService, 'getGuildUsage').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 429 })));
    component.getServerData();

    expect(dataService.redirectLoginError).toHaveBeenCalledWith('REQUESTS');

    jest.spyOn(apiService, 'getGuildUsage').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.getServerData();

    expect(dataService.redirectLoginError).toHaveBeenCalledWith('OFFLINE');

    jest.spyOn(apiService, 'getGuildUsage').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    component.getServerData();

    expect(dataService.isLoading).toBeFalsy();
  });

  it('should not re-cache same data if already cached & don\'t do anything if its not in dashboard page', () => {
    const guildUsageMock: SliderItems[] = [{ image_url: '', guild_name: '', guild_invite: '', member_count: 0 }];
    const moduleStatusMock = {
      task_1: {
        finished: true,
        cached: true,
        guild_id: '1',
        subtasks: [
          { id: '1', finished: true },
          { id: '2', finished: false }
        ]
      }
    };

    jest.spyOn(apiService, 'getGuildUsage').mockReturnValue(of(guildUsageMock));
    jest.spyOn(apiService, 'getModuleStatus').mockReturnValue(of(moduleStatusMock));
    dataService.active_guild = { id: '1', name: '' } as unknown as Guild;

    localStorage.removeItem('moduleStatus');
    localStorage.removeItem('moduleStatusTimestamp');
    component.getServerData();

    expect(dataService.isLoading).toBeFalsy();
    expect(localStorage.getItem('moduleStatus')).toBeNull();

    window = Object.create(window);
    dataService.isLoading = true;
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/' }, writable: true });
    component.getServerData();
    expect(dataService.isLoading).toBeTruthy();
  });

  it('should update tasks with their completion status', () => {
    const moduleStatus = {
      task_1: {
        finished: true,
        guild_id: '1',
        subtasks: [
          { id: '1', finished: true },
          { id: '2', finished: false }
        ]
      },
      task_2: {
        finished: false,
        guild_id: '1',
        subtasks: [
          { id: '3', finished: true }
        ]
      }
    };

    component['tasks'] = [
      { id: 1, finished: false, title: '', subtasks: [
          { id: 1, finished: false, name: '', redirect_url: ''}, { id: 2, finished: false,  name: '',  redirect_url: ''}] },
      { id: 2, finished: false, title: '', subtasks: [{ id: 3, finished: false, name: '', redirect_url: ''}] }
    ];

    component['updateTasks'](moduleStatus);

    expect(component['tasks'][0].finished).toBe(true);
    expect(component['tasks'][0].subtasks[0].finished).toBe(true);
    expect(component['tasks'][0].subtasks[1].finished).toBe(false);
    expect(component['tasks'][1].finished).toBe(false);
    expect(component['tasks'][1].subtasks[0].finished).toBe(true);
  });

  it('should toggle the expansion state of a task', () => {
    const taskId = 1;
    component['expandedTasks'] = [];

    // Toggle to expand the task
    component.toggleTask(taskId);
    expect(component['expandedTasks']).toContain(taskId);

    // Toggle to collapse the task
    component.toggleTask(taskId);
    expect(component['expandedTasks']).not.toContain(taskId);
  });

  it('should return true if any subtask is finished', () => {
    const subtasks = [
      { id: 1, finished: false, name: '', redirect_url: '' },
      { id: 2, finished: true, name: '', redirect_url: '' }
    ];

    expect(component.isInProgress(subtasks)).toBe(true);
  });

  it('should calculate the total number of completed tasks correctly', () => {
    component['tasks'] = [
      { id: 1, finished: true, title: '', subtasks: [
          { id: 1, finished: true, name: '', redirect_url: ''}, { id: 2, finished: false,  name: '',  redirect_url: ''}] },
      { id: 2, finished: false, title: '', subtasks: [{ id: 3, finished: true, name: '', redirect_url: ''}] }
    ];

    expect(component.completedTasks).toBe(3);
  });

  it('should calculate the total number of tasks correctly', () => {
    component['tasks'] = [
      { id: 1, finished: false, title: '', subtasks: [
        { id: 1, finished: false, name: '', redirect_url: ''}, { id: 2, finished: false,  name: '',  redirect_url: ''}] },
      { id: 2, finished: true, title: '', subtasks: [{ id: 3, finished: true, name: '', redirect_url: ''}] }
    ];

    expect(component.totalTasks).toBe(5);
  });
});
