import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {LogsComponent} from './logs.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {Channel} from "../../../../services/types/discord/Guilds";
import {defer} from 'rxjs';
import {SecurityLogs} from "../../../../services/types/Security";

describe('LogsComponent', () => {
  let component: LogsComponent;
  let fixture: ComponentFixture<LogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    component['dataService'].allowDataFetch.next(true);

    expect(component['dataService'].isLoading).toBeTruthy();
  });

  it('should set selectedLog and tempLog when conditions are met in ngAfterViewChecked', fakeAsync(() => {
    const guildChannels: Channel[] = [
      { id: '123', name: 'TestChannel' } as Channel,
      { id: '456', name: 'OtherChannel' } as Channel
    ];
    component['dataService'].guild_channels = guildChannels;
    component['dataService'].security_logs = { channel_id: '123' } as any;
    component['selectedLog'] = null;
    component['refreshState'] = false;

    component.ngAfterViewChecked();
    tick();

    expect(component['selectedLog']).toEqual(guildChannels[0]);
    expect(component['tempLog']).toEqual(guildChannels[0]);
    expect(component['refreshState']).toBe(false);
  }));

  it('should set selectedLog and tempLog to null if no channel matches channel_id in ngAfterViewChecked', fakeAsync(() => {
    component['dataService'].guild_channels = [
      { id: '123', name: 'TestChannel' } as Channel,
      { id: '456', name: 'OtherChannel' } as Channel
    ];
    component['dataService'].security_logs = { channel_id: '789' } as any; // channel_id not matching
    component['selectedLog'] = null;
    component['refreshState'] = false;

    component.ngAfterViewChecked();
    tick();

    expect(component['selectedLog']).toBeNull();
    expect(component['tempLog']).toBeNull();
  }));

  it('should not set selectedLog if conditions are not met in ngAfterViewChecked', fakeAsync(() => {
    component['dataService'].guild_channels = null as any;
    component['dataService'].security_logs = { channel_id: '123' } as any;
    component['selectedLog'] = null;
    component['refreshState'] = false;

    component.ngAfterViewChecked();
    tick();

    expect(component['selectedLog']).toBeNull();
    expect(component['tempLog']).toBeNull();
  }));

  it('should set selectedLog if refreshState is true in ngAfterViewChecked', fakeAsync(() => {
    const guildChannels: Channel[] = [
      { id: '123', name: 'TestChannel' } as Channel
    ];
    component['dataService'].guild_channels = guildChannels;
    component['dataService'].security_logs = { channel_id: '123' } as any;
    component['selectedLog'] = guildChannels[0];
    component['refreshState'] = true;

    component.ngAfterViewChecked();
    tick();

    expect(component['selectedLog']).toEqual(guildChannels[0]);
    expect(component['tempLog']).toEqual(guildChannels[0]);
    expect(component['refreshState']).toBe(false);
  }));

  it('should use cached logs from localStorage if available and not older than 30 seconds', fakeAsync(() => {
    const mockLogs = { channel_id: '123' };
    localStorage.setItem('security_logs', JSON.stringify(mockLogs));
    localStorage.setItem('security_logs_type', 'PENDING');
    localStorage.setItem('guild_vip', 'true');
    localStorage.setItem('security_logs_timestamp', Date.now().toString());
    component['dataService'].active_guild = { id: 'guild1' } as any;
    jest.spyOn(component['dataService'], 'getGuildChannels').mockImplementation();

    component['getSecurityLogs']();
    tick(101);

    expect(component['dataService'].security_logs).toEqual(mockLogs);
    expect(component['dataService'].getGuildChannels).toHaveBeenCalledWith(component['comService'], undefined, true, 'FORUM');

    // check "security_logs_type" is set to "PENDING" branch
    jest.spyOn(component as any, 'getSecurityLogs');
    localStorage.setItem('security_logs_type', 'FORUM');

    component['getSecurityLogs']();

    expect(component['getSecurityLogs']).toHaveBeenCalledWith(true);
  }));

  it('should fetch logs from API if no cache is present', fakeAsync(() => {
    localStorage.removeItem('security_logs');
    localStorage.removeItem('security_logs_timestamp');
    component['dataService'].active_guild = { id: 'guild1' } as any;
    const mockLogs = { channel_id: '456' } as SecurityLogs;
    jest.spyOn(component['apiService'], 'getSecurityLogsPending').mockReturnValue(defer(() => Promise.resolve(mockLogs)));
    jest.spyOn(component['dataService'], 'getGuildChannels').mockImplementation();

    component['getSecurityLogs']();
    tick(551);

    expect(component['dataService'].security_logs).toEqual(mockLogs);
    expect(localStorage.getItem('security_logs')).toEqual(JSON.stringify(mockLogs));
    expect(component['dataService'].getGuildChannels).toHaveBeenCalledWith(component['comService'], undefined, true, 'FORUM');
  }));

  it('should fetch logs from API if cache is older than 30 seconds', fakeAsync(() => {
    const oldTimestamp = Date.now() - 31000;
    localStorage.setItem('security_logs', JSON.stringify({ channel_id: 'old' }));
    localStorage.setItem('security_logs_timestamp', oldTimestamp.toString());
    component['dataService'].active_guild = { id: 'guild1' } as any;
    const mockLogs = { channel_id: 'new' } as SecurityLogs;
    jest.spyOn(component['apiService'], 'getSecurityLogsPending').mockReturnValue(defer(() => Promise.resolve(mockLogs)));
    jest.spyOn(component['dataService'], 'getGuildChannels').mockImplementation();

    component['getSecurityLogs']();
    tick(551);

    expect(component['dataService'].security_logs).toEqual(mockLogs);
    expect(localStorage.getItem('security_logs')).toEqual(JSON.stringify(mockLogs));
    expect(component['dataService'].getGuildChannels).toHaveBeenCalledWith(component['comService'], undefined, true, 'FORUM');
  }));

  it('should fetch logs from API if no_cache is true', fakeAsync(() => {
    localStorage.setItem('security_logs', JSON.stringify({ channel_id: 'cached' }));
    localStorage.setItem('security_logs_timestamp', Date.now().toString());
    component['dataService'].active_guild = { id: 'guild1' } as any;
    const mockLogs = { channel_id: 'api' } as SecurityLogs;
    jest.spyOn(component['apiService'], 'getSecurityLogsPending').mockReturnValue(defer(() => Promise.resolve(mockLogs)));
    jest.spyOn(component['dataService'], 'getGuildChannels').mockImplementation();

    component['getSecurityLogs'](true);
    tick(551);

    expect(component['dataService'].security_logs).toEqual(mockLogs);
    expect(localStorage.getItem('security_logs')).toEqual(JSON.stringify(mockLogs));
    expect(component['dataService'].getGuildChannels).toHaveBeenCalledWith(component['comService'], true, true, 'FORUM');
  }));

  it('should not fetch logs if active_guild is missing', fakeAsync(() => {
    component['dataService'].active_guild = null as any;
    const apiSpy = jest.spyOn(component['apiService'], 'getSecurityLogsPending');
    component['getSecurityLogs']();
    expect(apiSpy).not.toHaveBeenCalled();
  }));

  it('should handle API error 429 (rate limit) and call redirectLoginError', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    jest.spyOn(component['apiService'], 'getSecurityLogsPending').mockReturnValue(defer(() => Promise.reject({ status: 429 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['getSecurityLogs'](true);
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle API error 0 (offline) and call redirectLoginError', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    jest.spyOn(component['apiService'], 'getSecurityLogsPending').mockReturnValue(defer(() => Promise.reject({ status: 0 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['getSecurityLogs'](true);
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
  }));

  it('should handle unknown API error and call redirectLoginError', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    jest.spyOn(component['apiService'], 'getSecurityLogsPending').mockReturnValue(defer(() => Promise.reject({ status: 500 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['getSecurityLogs'](true);
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  }));

  it('should update security logs and UI on successful forum update', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['tempLog'] = { id: '123', name: 'TestChannel' } as any;
    jest.spyOn(component['apiService'], 'updateLogForum').mockReturnValue(defer(() => Promise.resolve({})));
    const updateLogListSpy = jest.spyOn(component as any, 'updateLogList').mockImplementation();
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();

    component['saveLogForum']();
    tick();

    expect(component['selectedLog']).toEqual(component['tempLog']);
    expect(updateLogListSpy).toHaveBeenCalled();
    expect(component['dataService'].error_color).toBe('green');
    expect(showAlertSpy).toHaveBeenCalled();
    expect(localStorage.getItem('security_logs')).toBeTruthy();
  }));

  it('should update security logs and UI on successful forum delete', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['tempLog'] = { id: '123', name: 'TestChannel' } as any;
    jest.spyOn(component['apiService'], 'updateLogForum').mockReturnValue(defer(() => Promise.resolve({})));
    const updateLogListSpy = jest.spyOn(component as any, 'updateLogList').mockImplementation();
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();

    component['saveLogForum'](true);
    tick();

    expect(component['selectedLog']).toEqual(component['tempLog']);
    expect(updateLogListSpy).toHaveBeenCalled();
    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalled();
    expect(localStorage.getItem('security_logs')).toBeTruthy();
  }));

  it('should handle 404 error on delete and show not found alert', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['tempLog'] = { id: '123', name: 'TestChannel' } as any;
    jest.spyOn(component['apiService'], 'updateLogForum').mockReturnValue(defer(() => Promise.reject({ status: 404 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();

    component['saveLogForum'](true);
    tick();

    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalled();
    expect(component['tempLog']).toBeNull();
  }));

  it('should handle 409 error and show conflict alert', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['tempLog'] = { id: '123', name: 'TestChannel' } as any;
    jest.spyOn(component['apiService'], 'updateLogForum').mockReturnValue(defer(() => Promise.reject({ status: 409 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();

    component['saveLogForum']();
    tick();

    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalled();
    expect(component['tempLog']).toBeNull();
  }));

  it('should handle 409 error and show conflict alert (for deletion)', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['tempLog'] = { id: '123', name: 'TestChannel' } as any;
    jest.spyOn(component['apiService'], 'updateLogForum').mockReturnValue(defer(() => Promise.reject({ status: 409 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();

    component['saveLogForum'](true);
    tick();

    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalled();
    expect(component['tempLog']).toBeNull();
  }));

  it('should handle 429 error and call redirectLoginError with REQUESTS', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['tempLog'] = { id: '123', name: 'TestChannel' } as any;
    jest.spyOn(component['apiService'], 'updateLogForum').mockReturnValue(defer(() => Promise.reject({ status: 429 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['saveLogForum']();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle 0 error and call redirectLoginError with OFFLINE', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['tempLog'] = { id: '123', name: 'TestChannel' } as any;
    jest.spyOn(component['apiService'], 'updateLogForum').mockReturnValue(defer(() => Promise.reject({ status: 0 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['saveLogForum']();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
  }));

  it('should handle unknown error and call redirectLoginError with UNKNOWN', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['tempLog'] = { id: '123', name: 'TestChannel' } as any;
    jest.spyOn(component['apiService'], 'updateLogForum').mockReturnValue(defer(() => Promise.reject({ status: 500 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['saveLogForum']();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  }));

  it('should not call API if active_guild or tempLog is missing', () => {
    component['dataService'].active_guild = null as any;
    component['tempLog'] = { id: '123', name: 'TestChannel' } as any;
    const apiSpy = jest.spyOn(component['apiService'], 'updateLogForum');

    component['saveLogForum']();

    expect(apiSpy).not.toHaveBeenCalled();
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['tempLog'] = null as any;

    component['saveLogForum']();

    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should not save log threads if active_guild is missing', () => {
    component['dataService'].active_guild = null as any;
    component['selectedLog'] = { id: '123', name: 'TestChannel' } as any;
    const apiSpy = jest.spyOn(component['apiService'], 'updateLogThreads');
    component['saveLogThreads']();
    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should not save log threads if selectedLog is missing', () => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['selectedLog'] = null as any;
    const apiSpy = jest.spyOn(component['apiService'], 'updateLogThreads');
    component['saveLogThreads']();
    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should save log threads and update UI on success', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['selectedLog'] = { id: '123', name: 'TestChannel' } as any;
    component['log_list'] = [
      { category: 'test1', enabled: true } as any,
      { category: 'test2', enabled: false } as any
    ];
    component['dataService'].security_logs = {} as SecurityLogs;
    const mockLogs = { test1: '123', test2: null, guild_id: 'guild1' } as any;
    jest.spyOn(component['apiService'], 'updateLogThreads').mockReturnValue(defer(() => Promise.resolve(mockLogs)));
    const updateLogListSpy = jest.spyOn(component as any, 'updateLogList').mockImplementation();
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();

    component['saveLogThreads']();
    tick();

    expect(component['dataService'].security_logs).toEqual(mockLogs);
    expect(updateLogListSpy).toHaveBeenCalled();
    expect(component['sendState']).toBe(false);
    expect(component['dataService'].error_color).toBe('green');
    expect(showAlertSpy).toHaveBeenCalled();
    expect(localStorage.getItem('security_logs')).toEqual(JSON.stringify(mockLogs));
  }));

  it('should handle API error 429 and call redirectLoginError', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['selectedLog'] = { id: '123', name: 'TestChannel' } as any;
    component['log_list'] = [{ category: 'test1', enabled: true } as any];
    component['dataService'].security_logs = {} as SecurityLogs;
    jest.spyOn(component['apiService'], 'updateLogThreads').mockReturnValue(defer(() => Promise.reject({ status: 429 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['saveLogThreads']();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle API error 402 and call redirectLoginError', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['selectedLog'] = { id: '123', name: 'TestChannel' } as any;
    component['log_list'] = [{ category: 'test1', enabled: true } as any];
    component['dataService'].security_logs = {} as SecurityLogs;
    jest.spyOn(component['apiService'], 'updateLogThreads').mockReturnValue(defer(() => Promise.reject({ status: 402 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();

    component['saveLogThreads']();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(showAlertSpy).toHaveBeenCalled();
  }));

  it('should handle API error 0 and call redirectLoginError', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['selectedLog'] = { id: '123', name: 'TestChannel' } as any;
    component['log_list'] = [{ category: 'test1', enabled: true } as any];
    component['dataService'].security_logs = {} as SecurityLogs;
    jest.spyOn(component['apiService'], 'updateLogThreads').mockReturnValue(defer(() => Promise.reject({ status: 0 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['saveLogThreads']();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
  }));

  it('should handle unknown API error and call redirectLoginError', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['selectedLog'] = { id: '123', name: 'TestChannel' } as any;
    component['log_list'] = [{ category: 'test1', enabled: true } as any];
    component['dataService'].security_logs = {} as SecurityLogs;
    jest.spyOn(component['apiService'], 'updateLogThreads').mockReturnValue(defer(() => Promise.reject({ status: 500 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['saveLogThreads']();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  }));

  it('should disable the button, set loading and refreshState, call getSecurityLogs with no_cache=true, and re-enable the button after 10s', fakeAsync(() => {
    const element = document.createElement('button');
    element.disabled = false;
    jest.spyOn(component as any, 'getSecurityLogs').mockImplementation();

    component['refreshCache'](element);

    expect(element.disabled).toBe(true);
    expect(component['dataService'].isLoading).toBe(true);
    expect(component['refreshState']).toBe(true);
    expect(component['getSecurityLogs']).toHaveBeenCalledWith(true);

    tick(10000);
    expect(element.disabled).toBe(false);
  }));

  it('should not update log_list if security_logs is null', () => {
    component['dataService'].security_logs = null as any;
    const originalList = [...component['log_list']];

    component['updateLogList']();

    expect(component['log_list']).toEqual(originalList);
  });

  it('should set enabled to true if mainValue is not null and deleteValue is not true', () => {
    component['dataService'].security_logs = { test: 'value', test_pending: false, test_delete: false } as unknown as SecurityLogs;
    component['log_list'] = [{ category: 'test', enabled: false } as any];

    component['updateLogList']();

    expect(component['log_list'][0].enabled).toBe(true);
  });

  it('should set enabled to true if pendingValue is true and deleteValue is not true', () => {
    component['dataService'].security_logs = { test: null, test_pending: true, test_delete: false } as unknown as SecurityLogs;
    component['log_list'] = [{ category: 'test', enabled: false } as any];

    component['updateLogList']();

    expect(component['log_list'][0].enabled).toBe(true);
  });

  it('should set enabled to false if deleteValue is true', () => {
    component['dataService'].security_logs = { test: 'value', test_pending: true, test_delete: true } as unknown as SecurityLogs;
    component['log_list'] = [{ category: 'test', enabled: true } as any];

    component['updateLogList']();

    expect(component['log_list'][0].enabled).toBe(false);
  });

  it('should set enabledFeatures and disabledFeatures correctly', () => {
    component['dataService'].security_logs = {
      a: 'x', a_pending: false, a_delete: false,
      b: null, b_pending: false, b_delete: false,
      c: null, c_pending: true, c_delete: false,
      d: 'y', d_pending: false, d_delete: true
    } as unknown as SecurityLogs;
    component['log_list'] = [
      { category: 'a', enabled: false } as any,
      { category: 'b', enabled: true } as any,
      { category: 'c', enabled: false } as any,
      { category: 'd', enabled: true } as any
    ];

    component['updateLogList']();

    expect(component['enabledFeatures'].map(f => f.category)).toEqual(['a', 'c']);
    expect(component['disabledFeatures'].map(f => f.category)).toEqual(['b', 'd']);
  });

  it('should deep copy log_list to org_logs', () => {
    component['dataService'].security_logs = {test: 'value', test_pending: false, test_delete: false} as unknown as SecurityLogs;
    component['log_list'] = [{ category: 'test', enabled: false } as any];

    component['updateLogList']();

    expect(component['org_logs']).not.toBe(component['log_list']);
    expect(component['org_logs']).toEqual(component['log_list']);
  });

  it('should return the correct channel when channel_id matches', () => {
    const guildChannels: Channel[] = [
      { id: '123', name: 'TestChannel' } as Channel,
      { id: '456', name: 'OtherChannel' } as Channel
    ];
    component['dataService'].guild_channels = guildChannels;

    const result = component['setTempLog']('123');
    expect(result).toEqual(guildChannels[0]);
  });

  it('should return null when channel_id does not match any channel', () => {
    component['dataService'].guild_channels = [
      {id: '123', name: 'TestChannel'} as Channel,
      {id: '456', name: 'OtherChannel'} as Channel
    ];

    const result = component['setTempLog']('789');
    expect(result).toBeNull();
  });
});
