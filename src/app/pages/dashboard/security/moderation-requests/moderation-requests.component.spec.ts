import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { ModerationRequestsComponent } from './moderation-requests.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {defer} from "rxjs";
import {Guild} from "../../../../services/types/discord/Guilds";
import {UnbanRequest} from "../../../../services/types/Security";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('ModerationRequestsComponent', () => {
  let component: ModerationRequestsComponent;
  let fixture: ComponentFixture<ModerationRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModerationRequestsComponent, TranslateModule.forRoot(), HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: {}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModerationRequestsComponent);
    component = fixture.componentInstance;
    component['dataService'].allowDataFetch.next(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call apiService.updateUnbanRequest with correct params and handle approve success', fakeAsync(() => {
    const request = {
      guild_id: 'guild1',
      user_id: 'user1',
      user_name: 'TestUser',
      staff_id: 'staff1',
      staff_name: 'StaffUser',
      ban_reason: 'reason',
      excuse: 'excuse'
    } as UnbanRequest;
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    component['dataService'].unban_requests = [request];
    component['dataService'].filteredRequests = [request];
    localStorage.removeItem('unban_requests');
    const apiSpy = jest.spyOn(component['apiService'], 'updateUnbanRequest').mockReturnValue(defer(() => Promise.resolve({})));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const markdownSpy = jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('TestUser');

    component['updateUnbanRequest'](request, 1);
    tick();

    expect(apiSpy).toHaveBeenCalledWith('guild1', 'user1', 1);
    expect(component['dataService'].error_color).toBe('green');
    expect(showAlertSpy).toHaveBeenCalled();
    expect(component['dataService'].unban_requests.length).toBe(0);
    expect(localStorage.getItem('unban_requests')).toBe(JSON.stringify([]));
    markdownSpy.mockRestore();
  }));

  it('should call apiService.updateUnbanRequest with correct params and handle deny success', fakeAsync(() => {
    const request = {
      guild_id: 'guild1',
      user_id: 'user1',
      user_name: 'TestUser',
      staff_id: 'staff1',
      staff_name: 'StaffUser',
      ban_reason: 'reason',
      excuse: 'excuse'
    } as UnbanRequest;
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    component['dataService'].unban_requests = [request];
    component['dataService'].filteredRequests = [request];
    localStorage.removeItem('unban_requests');
    const apiSpy = jest.spyOn(component['apiService'], 'updateUnbanRequest').mockReturnValue(defer(() => Promise.resolve({})));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const markdownSpy = jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('TestUser');

    component['updateUnbanRequest'](request, 2);
    tick();

    expect(apiSpy).toHaveBeenCalledWith('guild1', 'user1', 2);
    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalled();
    expect(component['dataService'].unban_requests.length).toBe(0);
    expect(localStorage.getItem('unban_requests')).toBe(JSON.stringify([]));
    markdownSpy.mockRestore();
  }));

  it('should handle 404 error and show not found alert', fakeAsync(() => {
    const request = {
      guild_id: 'guild1',
      user_id: 'user1',
      user_name: 'TestUser',
      staff_id: 'staff1',
      staff_name: 'StaffUser',
      ban_reason: 'reason',
      excuse: 'excuse'
    } as UnbanRequest;
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const apiSpy = jest.spyOn(component['apiService'], 'updateUnbanRequest').mockReturnValue(defer(() => Promise.reject({ status: 404 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['updateUnbanRequest'](request, 1);
    tick();

    expect(apiSpy).toHaveBeenCalled();
    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalledWith(
      component['translate'].instant('ERROR_SECURITY_UNBAN_NOT_FOUND_TITLE'),
      component['translate'].instant('ERROR_SECURITY_UNBAN_NOT_FOUND_DESC')
    );
  }));

  it('should handle 429 error and call redirectLoginError', fakeAsync(() => {
    const request = {
      guild_id: 'guild1',
      user_id: 'user1',
      user_name: 'TestUser',
      staff_id: 'staff1',
      staff_name: 'StaffUser',
      ban_reason: 'reason',
      excuse: 'excuse'
    } as UnbanRequest;
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const apiSpy = jest.spyOn(component['apiService'], 'updateUnbanRequest').mockReturnValue(defer(() => Promise.reject({ status: 429 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    component['updateUnbanRequest'](request, 1);
    tick();

    expect(apiSpy).toHaveBeenCalled();
    expect(component['dataService'].error_color).toBe('red');
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle unknown error and show unknown error alert', fakeAsync(() => {
    const request = {
      guild_id: 'guild1',
      user_id: 'user1',
      user_name: 'TestUser',
      staff_id: 'staff1',
      staff_name: 'StaffUser',
      ban_reason: 'reason',
      excuse: 'excuse'
    } as UnbanRequest;
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const apiSpy = jest.spyOn(component['apiService'], 'updateUnbanRequest').mockReturnValue(defer(() => Promise.reject({ status: 500 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['updateUnbanRequest'](request, 1);
    tick();

    expect(apiSpy).toHaveBeenCalled();
    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalledWith(
      component['translate'].instant('ERROR_UNKNOWN_TITLE'),
      component['translate'].instant('ERROR_UNKNOWN_DESC')
    );
  }));

  it('should return early if no active_guild is set', () => {
    const request = {
      guild_id: 'guild1',
      user_id: 'user1',
      user_name: 'TestUser',
      staff_id: 'staff1',
      staff_name: 'StaffUser',
      ban_reason: 'reason',
      excuse: 'excuse'
    } as UnbanRequest;
    component['dataService'].active_guild = null;
    const apiSpy = jest.spyOn(component['apiService'], 'updateUnbanRequest');

    component['updateUnbanRequest'](request, 1);

    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should disable the cache button, set loading, call getSecurityLogs and re-enable the button after 15s', fakeAsync(() => {
    component['disabledCacheBtn'] = false;
    component['dataService'].isLoading = false;
    const getSecurityLogsSpy = jest.spyOn(component['dataService'], 'getSecurityLogs');

    component['refreshCache']();

    expect(component['disabledCacheBtn']).toBe(true);
    expect(component['dataService'].isLoading).toBe(true);
    expect(getSecurityLogsSpy).toHaveBeenCalledWith(component['apiService'], true, true);

    tick(14999);
    expect(component['disabledCacheBtn']).toBe(true);

    tick(1);
    expect(component['disabledCacheBtn']).toBe(false);

    getSecurityLogsSpy.mockRestore();
  }));

  it('should filter unban requests by user_name (case-insensitive)', () => {
    component['dataService'].unban_requests = [
      { user_name: 'TestUser', user_id: '1', staff_id: '2', staff_name: 'Staff', ban_reason: 'reason', excuse: 'excuse', guild_id: 'g1' } as any,
      { user_name: 'Another', user_id: '2', staff_id: '3', staff_name: 'Staff2', ban_reason: 'reason2', excuse: 'excuse2', guild_id: 'g1' } as any
    ];
    const event = { target: { value: 'testuser' } } as unknown as Event;
    component['searchUnbanRequest'](event);
    expect(component['dataService'].filteredRequests.length).toBe(1);
    expect(component['dataService'].filteredRequests[0].user_name).toBe('TestUser');
  });

  it('should filter unban requests by user_id', () => {
    component['dataService'].unban_requests = [
      { user_name: 'User', user_id: 'abc123', staff_id: '2', staff_name: 'Staff', ban_reason: 'reason', excuse: 'excuse', guild_id: 'g1' } as any
    ];
    const event = { target: { value: 'abc123' } } as unknown as Event;
    component['searchUnbanRequest'](event);
    expect(component['dataService'].filteredRequests.length).toBe(1);
    expect(component['dataService'].filteredRequests[0].user_id).toBe('abc123');
  });

  it('should filter unban requests by staff_id', () => {
    component['dataService'].unban_requests = [
      { user_name: 'User', user_id: '1', staff_id: 'staffX', staff_name: 'Staff', ban_reason: 'reason', excuse: 'excuse', guild_id: 'g1' } as any
    ];
    const event = { target: { value: 'staffx' } } as unknown as Event;
    component['searchUnbanRequest'](event);
    expect(component['dataService'].filteredRequests.length).toBe(1);
    expect(component['dataService'].filteredRequests[0].staff_id).toBe('staffX');
  });

  it('should filter unban requests by staff_name', () => {
    component['dataService'].unban_requests = [
      { user_name: 'User', user_id: '1', staff_id: '2', staff_name: 'SpecialStaff', ban_reason: 'reason', excuse: 'excuse', guild_id: 'g1' } as any
    ];
    const event = { target: { value: 'specialstaff' } } as unknown as Event;
    component['searchUnbanRequest'](event);
    expect(component['dataService'].filteredRequests.length).toBe(1);
    expect(component['dataService'].filteredRequests[0].staff_name).toBe('SpecialStaff');
  });

  it('should filter unban requests by ban_reason', () => {
    component['dataService'].unban_requests = [
      { user_name: 'User', user_id: '1', staff_id: '2', staff_name: 'Staff', ban_reason: 'Spam', excuse: 'excuse', guild_id: 'g1' } as any
    ];
    const event = { target: { value: 'spam' } } as unknown as Event;
    component['searchUnbanRequest'](event);
    expect(component['dataService'].filteredRequests.length).toBe(1);
    expect(component['dataService'].filteredRequests[0].ban_reason).toBe('Spam');
  });

  it('should filter unban requests by excuse', () => {
    component['dataService'].unban_requests = [
      { user_name: 'User', user_id: '1', staff_id: '2', staff_name: 'Staff', ban_reason: 'reason', excuse: 'Sorry for that', guild_id: 'g1' } as any
    ];
    const event = { target: { value: 'sorry' } } as unknown as Event;
    component['searchUnbanRequest'](event);
    expect(component['dataService'].filteredRequests.length).toBe(1);
    expect(component['dataService'].filteredRequests[0].excuse).toBe('Sorry for that');
  });

  it('should return empty filteredRequests if no match found', () => {
    component['dataService'].unban_requests = [
      { user_name: 'User', user_id: '1', staff_id: '2', staff_name: 'Staff', ban_reason: 'reason', excuse: 'excuse', guild_id: 'g1' } as any
    ];
    const event = { target: { value: 'notfound' } } as unknown as Event;
    component['searchUnbanRequest'](event);
    expect(component['dataService'].filteredRequests.length).toBe(0);
  });

  it('should call updateUnbanRequest with correct params when approve or deny action is triggered', () => {
    const request = {
      guild_id: 'guild1',
      user_id: 'user1',
      user_name: 'TestUser',
      staff_id: 'staff1',
      staff_name: 'StaffUser',
      ban_reason: 'reason',
      excuse: 'excuse'
    } as UnbanRequest;

    const updateSpy = jest.spyOn(component as any, 'updateUnbanRequest');

    component['tableConfig'].action_btn[0].action(request);
    expect(updateSpy).toHaveBeenCalledWith(request, 1);

    component['tableConfig'].action_btn[1].action(request);
    expect(updateSpy).toHaveBeenCalledWith(request, 2);

    updateSpy.mockRestore();
  });
});
