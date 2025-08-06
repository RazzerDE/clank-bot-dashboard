import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { ModuleSetupComponent } from './module-setup.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {BehaviorSubject, defer, of} from "rxjs";
import {SubTasksCompletion, TasksCompletion, TasksCompletionList} from "../../../../services/types/Tasks";
import {Channel, Guild, SupportSetup} from "../../../../services/types/discord/Guilds";
import {HttpErrorResponse} from "@angular/common/http";
import {ComService} from "../../../../services/discord-com/com.service";

describe('ModuleSetupComponent', () => {
  let component: ModuleSetupComponent;
  let fixture: ComponentFixture<ModuleSetupComponent>;
  let dataService: DataHolderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleSetupComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: '' },
        { provide: DataHolderService, useValue: { allowDataFetch: of(true), showAlert: jest.fn(), servers: [],
                                                  redirectLoginError: jest.fn(), error_color: '', isDisabledSpamBtn: false,
                                                  handleApiError: jest.fn(), sidebarStateChanged: new BehaviorSubject<boolean>(false) } },
        { provide: ComService, useValue: { setSupportForum: jest.fn() } },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleSetupComponent);
    dataService = TestBed.inject(DataHolderService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should disable data loder if data was already loaded", () => {
    component['moduleStatusObj'] = {
      finished: false,
      subtasks: [
        { id: '1', finished: true },
        { id: '2', finished: false },
        { id: '3', finished: true }
      ]
    } as TasksCompletion;
    component['channelItems'] = [{ id: '1', name: 'General' }] as Channel[];
    component['dataLoading'] = { statusBox: true, channelItems: true };

    dataService.isLoading = false;

    jest.useFakeTimers();
    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['dataLoading']).toEqual({ statusBox: false, channelItems: false });
  });

  it('should set the support forum channel and show success alert on successful response', fakeAsync(() => {
    const channel = { id: '1', name: 'General' } as Channel;
    dataService.active_guild = { id: '123' } as Guild;
    dataService.isDisabledSpamBtn = true;

    const setSupportForumSpy = jest.spyOn(component['discordService'], 'setSupportForum').mockResolvedValue(defer(() => Promise.resolve(null)));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['setForumChannel'](channel);
    tick(251);

    expect(component['supportForum']).toEqual({ channel: channel, pending: true });
    expect(component['dataService'].error_color).toBe('green');
    expect(showAlertSpy).toHaveBeenCalledWith('SUCCESS_SAVE', 'SUCCESS_FORUM_DESC');
    expect(dataService.isDisabledSpamBtn).toBe(false);
    setSupportForumSpy.mockRestore();
    showAlertSpy.mockRestore();
  }));

  it('should return early if active_guild is not set', () => {
    dataService.active_guild = null;
    component['getServerData']();
    expect(component['moduleStatusObj']).toBeUndefined();
  });

  it('should set isLoading when no_cache is true', () => {
    dataService.active_guild = { id: '123' } as Guild;
    component['getServerData'](true);
    expect(dataService.isLoading).toBe(true);
  });

  it('should use cached data when valid cache exists', () => {
    dataService.active_guild = { id: '123' } as Guild;

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Setup mock returns
    const cachedStatus = JSON.stringify({
      task_1: {
        finished: true,
        subtasks: [{ finished: true }, { finished: true }, { finished: true }, { finished: true }]
      }
    });
    const cachedSupportSetup = JSON.stringify({
      support_forum: { id: '1', name: 'Forum' },
      support_forum_pending: true,
      discord_channels: [{ id: '2', name: 'General' }]
    });

    localStorageMock.getItem
      .mockImplementation((key) => {
        if (key === 'moduleStatus') return cachedStatus;
        if (key === 'moduleStatusTimestamp') return (Date.now() - 100000).toString(); // Recent timestamp
        if (key === 'supportSetup') return cachedSupportSetup;
        return null;
      });

    const updateStatusSpy = jest.spyOn(component as any, 'updateStatus');

    component['getServerData']();

    // Verify the cached data was used
    expect(component['moduleStatusObj']).toEqual({
      finished: true,
      subtasks: [{ finished: true }, { finished: true }, { finished: true }] // Last element removed
    });
    expect(component['supportForum']).toEqual({
      channel: { id: '1', name: 'Forum' },
      pending: true
    });
    expect(component['channelItems']).toEqual([{ id: '2', name: 'General' }]);
    expect(updateStatusSpy).toHaveBeenCalled();
    expect(dataService.isLoading).toBe(false);
  });

  it('should handle invalid cached moduleStatus', fakeAsync(() => {
    dataService.active_guild = { id: '123' } as Guild;

    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    localStorageMock.getItem
      .mockImplementation((key) => {
        if (key === 'moduleStatus') return 'null';
        if (key === 'moduleStatusTimestamp') return (Date.now() - 100000).toString();
        if (key === 'supportSetup') return '{}';
        return null;
      });

    const apiServiceSpy = jest.spyOn(component['apiService'], 'getModuleStatus')
      .mockReturnValue(defer(() => Promise.resolve({})));

    component['getServerData']();
    tick();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('moduleStatus');
    expect(apiServiceSpy).not.toHaveBeenCalled();
  }));

  it('should fetch fresh data when cache is expired', fakeAsync(() => {
    dataService.active_guild = { id: '123' } as Guild;

    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    localStorageMock.getItem
      .mockImplementation((key) => {
        if (key === 'moduleStatus') return '{}';
        if (key === 'moduleStatusTimestamp') return (Date.now() - 600000).toString(); // Expired timestamp
        if (key === 'supportSetup') return '{}';
        return null;
      });

    const mockModuleStatus = {
      task_1: {
        finished: false,
        subtasks: [{finished: true}, {finished: false}, {finished: false}, {finished: true}]
      }
    } as unknown as TasksCompletionList;

    const mockSupportSetup = {
      support_forum: { id: '3', name: 'Support' },
      support_forum_pending: false,
      discord_channels: [{ id: '4', name: 'Help' }]
    } as SupportSetup;

    const getModuleStatusSpy = jest.spyOn(component['apiService'], 'getModuleStatus')
      .mockReturnValue(defer(() => Promise.resolve(mockModuleStatus)));

    const getSupportSetupSpy = jest.spyOn(component['apiService'], 'getSupportSetupStatus')
      .mockReturnValue(defer(() => Promise.resolve(mockSupportSetup)));

    component['getServerData']();
    tick();

    expect(getModuleStatusSpy).toHaveBeenCalled();
    expect(component['moduleStatusObj']).toEqual({
      finished: false,
      subtasks: [{ finished: true }, { finished: false }, { finished: false }]
    });

    tick(1000);

    expect(getSupportSetupSpy).toHaveBeenCalledWith('123');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('supportSetup', JSON.stringify(mockSupportSetup));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('moduleStatusTimestamp', expect.any(String));

  }));

  it('should handle API error in getModuleStatus', fakeAsync(() => {
    dataService.active_guild = { id: '123' } as Guild;
    const errorResponse = new HttpErrorResponse({ status: 500 });

    jest.spyOn(component['apiService'], 'getModuleStatus')
      .mockReturnValue(defer(() => Promise.reject(errorResponse)));

    const handleApiErrorSpy = jest.spyOn(dataService, 'handleApiError');

    component['getServerData']();
    tick();

    expect(handleApiErrorSpy).toHaveBeenCalledWith(errorResponse);
  }));

  it('should handle API error in getSupportSetupStatus', fakeAsync(() => {
    dataService.active_guild = { id: '123' } as Guild;
    const moduleStatusResponse = {
      task_1: {finished: false, subtasks: []}
    } as unknown as TasksCompletionList;
    const errorResponse = new HttpErrorResponse({ status: 404 });

    jest.spyOn(component['apiService'], 'getModuleStatus')
      .mockReturnValue(defer(() => Promise.resolve(moduleStatusResponse)));
    jest.spyOn(component['apiService'], 'getSupportSetupStatus')
      .mockReturnValue(defer(() => Promise.reject(errorResponse)));

    const handleApiErrorSpy = jest.spyOn(dataService, 'handleApiError');

    component['getServerData']();
    tick(1500);

    expect(handleApiErrorSpy).toHaveBeenCalledWith(errorResponse);
  }));

  it('should show error alert if response status is 409', fakeAsync(() => {
    const channel = { id: '1', name: 'General' } as Channel;
    dataService.active_guild = { id: '123' } as Guild;
    const errorResponse = new HttpErrorResponse({ status: 409 });

    const setSupportForumSpy = jest.spyOn(component['discordService'], 'setSupportForum')
      .mockResolvedValue(defer(() => Promise.reject(errorResponse)));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['setForumChannel'](channel);
    tick(251);

    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_SAVE', 'ERROR_FORUM_DESC');
    setSupportForumSpy.mockRestore();
    showAlertSpy.mockRestore();
  }));

  it('should redirect to login error if response status is 429', async () => {
    const channel = { id: '1', name: 'General' } as Channel;
    dataService.active_guild = { id: '123' } as Guild;
    const errorResponse = new HttpErrorResponse({ status: 429 });
    const setSupportForumSpy = jest.spyOn(component['discordService'], 'setSupportForum').mockResolvedValue({
      subscribe: (callbacks: any) => {
        callbacks.error(errorResponse);
        return { unsubscribe: () => {} };
      }
    } as any);
    const redirectLoginErrorSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    await component['setForumChannel'](channel);

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('REQUESTS');
    setSupportForumSpy.mockRestore();
    redirectLoginErrorSpy.mockRestore();
  });

  it('should redirect to login error if response status is 403', async () => {
    const channel = { id: '1', name: 'General' } as Channel;
    dataService.active_guild = { id: '123' } as Guild;
    const errorResponse = new HttpErrorResponse({ status: 403 });
    const setSupportForumSpy = jest.spyOn(component['discordService'], 'setSupportForum').mockResolvedValue({
      subscribe: (callbacks: any) => {
        callbacks.error(errorResponse);
        return { unsubscribe: () => {} };
      }
    } as any);
    const redirectLoginErrorSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    await component['setForumChannel'](channel);

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('FORBIDDEN');
    setSupportForumSpy.mockRestore();
    redirectLoginErrorSpy.mockRestore();
  });

  it('should redirect to login error if response status is other than 409, 429, or 403', async () => {
    const channel = { id: '1', name: 'General' } as Channel;
    dataService.active_guild = { id: '123' } as Guild;
    const errorResponse = new HttpErrorResponse({ status: 500 });
    const setSupportForumSpy = jest.spyOn(component['discordService'], 'setSupportForum').mockResolvedValue({
      subscribe: (callbacks: any) => {
        callbacks.error(errorResponse);
        return { unsubscribe: () => {} };
      }
    } as any);
    const redirectLoginErrorSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    await component['setForumChannel'](channel);

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('EXPIRED');
    setSupportForumSpy.mockRestore();
    redirectLoginErrorSpy.mockRestore();
  });

  it ("should NOT set forum channel if active_guild is undefined", async () => {
    const channel = { id: '1', name: 'General' } as Channel;
    dataService.active_guild = null;

    const setSupportForumSpy = jest.spyOn(component['discordService'], 'setSupportForum').mockResolvedValue(of(null));

    await component['setForumChannel'](channel);

    expect(component['supportForum']).toEqual({ channel: null, pending: false });
    expect(setSupportForumSpy).not.toHaveBeenCalled();
    setSupportForumSpy.mockRestore();
  });

  it('should disable cache refresh and set loading state, then re-enable cache refresh after 60 seconds', fakeAsync(() => {
    const getServerDataSpy = jest.spyOn(component as any, 'getServerData' as any);

    component['refreshCache']();
    tick();

    expect(component['cacheRefreshDisabled']).toBe(true);
    expect(dataService.isLoading).toBe(true);
    expect(getServerDataSpy).toHaveBeenCalledWith(true);

    tick(65000); // Simulate 60 seconds passing
    expect(component['cacheRefreshDisabled']).toBe(false);
  }));

  it('should set moduleStatus to 2 if all tasks are finished', () => {
    component['moduleStatusObj'] = {finished: true, subtasks: []} as unknown as TasksCompletion;
    component['updateStatus']();
    expect(component['moduleStatus']).toBe(2);
  });

  it('should set moduleStatus to 0 if the first subtask is not finished', () => {
    component['moduleStatusObj'] = {
      finished: false,
      subtasks: [{ finished: false }] as SubTasksCompletion[]
    } as TasksCompletion;
    component['updateStatus']();
    expect(component['moduleStatus']).toBe(0);
  });

  it('should set moduleStatus to 1 if some subtasks are incomplete but the first subtask is finished', () => {
    component['moduleStatusObj'] = {
      finished: false,
      subtasks: [{ finished: true }, { finished: false }] as SubTasksCompletion[]
    } as TasksCompletion;
    component['updateStatus']();
    expect(component['moduleStatus']).toBe(1);
  });

  it("should return if moduleStatusObj is empty", () => {
    component['moduleStatusObj'] = undefined;
    const result: void = component['updateStatus']();
    expect(result).toBeUndefined();
  });

  it('should select the channel if it is not already selected', () => {
    const channel = { id: '1', name: 'General' } as Channel;
    component['selectedChannel'] = null;

    component['selectChannel'](channel);

    expect(component['selectedChannel']).toBe(channel);
  });

  it('should deselect the channel if it is already selected', () => {
    const channel = { id: '1', name: 'General' } as Channel;
    component['selectedChannel'] = channel;

    component['selectChannel'](channel);

    expect(component['selectedChannel']).toBeNull();
  });

});
