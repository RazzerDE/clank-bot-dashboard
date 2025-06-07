import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { BlockedUsersComponent } from './blocked-users.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {Guild} from "../../../../services/types/discord/Guilds";
import {BlockedUser, DiscordUser} from "../../../../services/types/discord/User";

describe('BlockedUsersComponent', () => {
  let component: BlockedUsersComponent;
  let fixture: ComponentFixture<BlockedUsersComponent>;
  let dataHolderService: DataHolderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockedUsersComponent, TranslateModule.forRoot(), HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockedUsersComponent);
    component = fixture.componentInstance;
    dataHolderService = TestBed.inject(DataHolderService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(document.title).toEqual('Blocked Users ~ Clank Discord-Bot');
  });

  it('should subscribe to allowDataFetch and fetch data when value is true', () => {
    const getBlockedUsersSpy = jest.spyOn(component as any, 'getBlockedUsers');
    dataHolderService.allowDataFetch.next(true);

    expect(getBlockedUsersSpy).toHaveBeenCalledWith(true);
    expect(component['subscriptions'].length).toBeGreaterThan(0);
  });

  it('should push subscription to subscriptions array', () => {
    expect(component['subscriptions'].length).toBeGreaterThan(0);
  });

  it('should set dataLoading to false after view is checked if conditions are met', () => {
    component['dataService'].isLoading = false;
    component['startLoading'] = false;
    component['dataLoading'] = true;

    jest.useFakeTimers();
    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['dataLoading']).toBe(false);
  });

  it('should fetch blocked users from cache if available and not expired', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    const mockBlockedUsers = [{ user_id: '123', user_name: 'TestUser' }] as BlockedUser[];
    localStorage.setItem('blocked_users', JSON.stringify(mockBlockedUsers));
    localStorage.setItem('blocked_users_timestamp', (Number(Date.now()) - 10000).toString());

    component['getBlockedUsers']();

    expect(component['user_list']).toEqual(mockBlockedUsers);
    expect(component['filteredUsers']).toEqual(mockBlockedUsers);
    expect(component['dataService'].isLoading).toBe(false);
    expect(component['startLoading']).toBe(false);
  });

  it('should fetch blocked users from API when no_cache is true', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    const mockBlockedUsers = [{ user_id: '123', user_name: 'TestUser' }];
    const apiSpy = jest.spyOn(component['apiService'], 'getBlockedUsers').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.next(mockBlockedUsers);
        return { unsubscribe: jest.fn() };
      }),
    } as any);

    component['getBlockedUsers'](true);

    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id);
    expect(component['user_list']).toEqual(mockBlockedUsers);
    expect(component['filteredUsers']).toEqual(mockBlockedUsers);
    expect(localStorage.getItem('blocked_users')).toEqual(JSON.stringify(mockBlockedUsers));
    expect(component['dataService'].isLoading).toBe(false);
    expect(component['startLoading']).toBe(false);
  });

  it('should handle API error with status 401', () => {
    jest.spyOn(component['apiService'], 'getBlockedUsers').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 401 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError');
    component['dataService'].active_guild = { id: 'test-guild-id', name: 'test' } as Guild;

    component['getBlockedUsers'](true);

    expect(redirectSpy).toHaveBeenCalledWith('NO_CLANK');
    expect(component['dataService'].isLoading).toBe(false);
    expect(component['startLoading']).toBe(false);
  });

  it('should handle API error with status 429', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    const apiSpy = jest.spyOn(component['apiService'], 'getBlockedUsers').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 429 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['getBlockedUsers'](true);

    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id);
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(component['dataService'].isLoading).toBe(false);
    expect(component['startLoading']).toBe(false);
  });

  it('should handle unknown API error', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    const apiSpy = jest.spyOn(component['apiService'], 'getBlockedUsers').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 500 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['getBlockedUsers'](true);

    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id);
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(component['dataService'].isLoading).toBe(false);
    expect(component['startLoading']).toBe(false);
  });

  it("should return void if active_guild is not set", () => {
    component['dataService'].active_guild = null;
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser' } as BlockedUser;

    component['deleteBlockedUser'](mockBlockedUser);

    expect(component['subscriptions'].length).toEqual(1);
  });

  it('should call deleteBlockedUser API and update the user list on success', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser' } as BlockedUser;
    const apiSpy = jest.spyOn(component['apiService'], 'deleteBlockedUser').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.next({});
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['user_list'] = [mockBlockedUser];
    component['deleteBlockedUser'](mockBlockedUser);

    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id, mockBlockedUser.user_id);
    expect(component['user_list']).toEqual([]);
    expect(alertSpy).toHaveBeenCalledWith('SUCCESS_USER_UNBLOCK_TITLE', 'SUCCESS_USER_UNBLOCK_DESC');
  });

  it('should handle 404 error and remove user from the list', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser' } as BlockedUser;
    const apiSpy = jest.spyOn(component['apiService'], 'deleteBlockedUser').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 404 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['user_list'] = [mockBlockedUser];
    component['deleteBlockedUser'](mockBlockedUser);

    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id, mockBlockedUser.user_id);
    expect(component['user_list']).toEqual([]);
    expect(alertSpy).toHaveBeenCalledWith('ERROR_USER_UNBLOCK_NOT_FOUND_TITLE', 'ERROR_USER_UNBLOCK_NOT_FOUND_DESC');
  });

  it('should handle 429 error and redirect to login error', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser' } as BlockedUser;
    const apiSpy = jest.spyOn(component['apiService'], 'deleteBlockedUser').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 429 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['deleteBlockedUser'](mockBlockedUser);

    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id, mockBlockedUser.user_id);
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  });

  it('should handle unknown error and show alert', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser' } as BlockedUser;
    const apiSpy = jest.spyOn(component['apiService'], 'deleteBlockedUser').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 500 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['deleteBlockedUser'](mockBlockedUser);

    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id, mockBlockedUser.user_id);
    expect(alertSpy).toHaveBeenCalledWith('ERROR_UNKNOWN_TITLE', 'ERROR_UNKNOWN_DESC');
  });

  it("should return void if active_guild is not set when adding a blocked user", () => {
    component['dataService'].active_guild = null;
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser' } as BlockedUser;

    component['addBlockedUser'](mockBlockedUser);

    expect(component['subscriptions'].length).toEqual(1);
  });

  it('should add a blocked user and update the user list on success', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    component['dataService'].profile = { id: 'test-profile-id' } as DiscordUser;
    let mockBlockedUser = { user_id: '123', user_name: 'TestUser', staff_avatar: "a_34554tgfdg" } as BlockedUser;
    component['newBlockedUser'] = { user_id: mockBlockedUser.user_id, user_name: mockBlockedUser.user_name, end_date: Date.now() + 10000 } as BlockedUser;

    let apiSpy = jest.spyOn(component['apiService'], 'addBlockedUser').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.next(mockBlockedUser);
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const updateListSpy = jest.spyOn(component as any, 'updateBlockedUserList');

    component['addBlockedUser'](mockBlockedUser);

    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id, mockBlockedUser);
    expect(alertSpy).toHaveBeenCalledWith('SUCCESS_USER_BLOCK_TITLE', expect.any(String));
    expect(updateListSpy).toHaveBeenCalledWith(mockBlockedUser);
    expect(component['disabledAddBtn']).toBe(false);

    // Branch test: use datePipe to transform end_date
    jest.spyOn(component['datePipe'], 'transform');
    mockBlockedUser = { user_id: '123', user_name: 'TestUser', end_date: Date.now() + 10000 } as BlockedUser;
    apiSpy = jest.spyOn(component['apiService'], 'addBlockedUser').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.next(mockBlockedUser);
        return { unsubscribe: jest.fn() };
      }),
    } as any);

    component['addBlockedUser'](mockBlockedUser);
    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id, mockBlockedUser);
    expect(component['datePipe'].transform).toHaveBeenCalledWith(mockBlockedUser.end_date, component['translate'].currentLang);
  });

  it('should handle 404 error when adding a blocked user', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    component['dataService'].profile = { id: 'test-profile-id' } as DiscordUser;
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser' } as BlockedUser;
    const apiSpy = jest.spyOn(component['apiService'], 'addBlockedUser').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 404 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['addBlockedUser'](mockBlockedUser);

    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id, mockBlockedUser);
    expect(alertSpy).toHaveBeenCalledWith(
      'ERROR_USER_BLOCK_NOT_FOUND_TITLE',
      expect.any(String)
    );
    expect(component['disabledAddBtn']).toBe(false);
  });

  it('should handle 429 error when adding a blocked user', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    component['dataService'].profile = { id: 'test-profile-id' } as DiscordUser;
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser' } as BlockedUser;
    const apiSpy = jest.spyOn(component['apiService'], 'addBlockedUser').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 429 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['addBlockedUser'](mockBlockedUser);

    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id, mockBlockedUser);
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  });

  it('should handle unknown error when adding a blocked user', () => {
    component['dataService'].active_guild = { id: 'test-guild-id' } as Guild;
    component['dataService'].profile = { id: 'test-profile-id' } as DiscordUser;
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser' } as BlockedUser;
    const apiSpy = jest.spyOn(component['apiService'], 'addBlockedUser').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 500 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['addBlockedUser'](mockBlockedUser);

    expect(apiSpy).toHaveBeenCalledWith(component['dataService'].active_guild.id, mockBlockedUser);
    expect(alertSpy).toHaveBeenCalledWith('ERROR_UNKNOWN_TITLE', 'ERROR_UNKNOWN_DESC');
    expect(component['disabledAddBtn']).toBe(false);
  });

  it('should update the blocked user list by adding a new user', () => {
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser', end_date: null } as BlockedUser;
    const mockBlockedUser2 = { user_id: '456', user_name: 'AnotherUser', end_date: null } as BlockedUser;
    const mockBlockedUser3 = { user_id: '789', user_name: 'ThirdUser', end_date: '2023-12-01T00:00:00Z' } as BlockedUser;
    const mockBlockedUser4 = { user_id: '101', user_name: 'FourthUser', end_date: '2023-12-01T00:00:00Z' } as BlockedUser;
    component['user_list'] = [mockBlockedUser2, mockBlockedUser3, mockBlockedUser4];

    component['updateBlockedUserList'](mockBlockedUser);

    expect(component['user_list']).toEqual([mockBlockedUser4, mockBlockedUser3, mockBlockedUser2, mockBlockedUser]);
    expect(localStorage.getItem('blocked_users')).toEqual(JSON.stringify([mockBlockedUser4, mockBlockedUser3, mockBlockedUser2, mockBlockedUser]));
  });

  it('should update the blocked user list by replacing an existing user', () => {
    const existingUser = { user_id: '123', user_name: 'OldUser', end_date: null } as BlockedUser;
    const updatedUser = { user_id: '123', user_name: 'UpdatedUser', end_date: null } as BlockedUser;
    component['user_list'] = [existingUser];

    component['updateBlockedUserList'](updatedUser);

    expect(component['user_list']).toEqual([updatedUser]);
    expect(localStorage.getItem('blocked_users')).toEqual(JSON.stringify([updatedUser]));
  });

  it('should sort the blocked user list by end_date and user_name', () => {
    const user1 = { user_id: '1', user_name: 'UserA', end_date: '2023-12-01T00:00:00Z' } as BlockedUser;
    const user2 = { user_id: '2', user_name: 'UserB', end_date: null } as BlockedUser;
    const user3 = { user_id: '3', user_name: 'UserC', end_date: '2023-11-01T00:00:00Z' } as BlockedUser;
    component['user_list'] = [user1, user2, user3];

    component['updateBlockedUserList'](user1);

    expect(component['user_list']).toEqual([user3, user1, user2]);
    expect(localStorage.getItem('blocked_users')).toEqual(JSON.stringify([user3, user1, user2]));
  });

  it('should update filteredUsers after updating the blocked user list', () => {
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser', end_date: null } as BlockedUser;
    component['user_list'] = [];

    component['updateBlockedUserList'](mockBlockedUser);

    expect(component['filteredUsers']).toEqual([mockBlockedUser]);
  });

  it('should refresh cache and re-enable cache button after 15 seconds', fakeAsync(() => {
    jest.spyOn(component as any, 'getBlockedUsers').mockImplementation(() => {});
    component['refreshCache']();

    expect(component['disabledCacheBtn']).toBe(true);
    expect(component['dataService'].isLoading).toBe(true);
    expect(component['getBlockedUsers']).toHaveBeenCalledWith(true);

    tick(15000); // Simulate the passage of 30 seconds
    expect(component['disabledCacheBtn']).toBe(false);
  }));

  it('should filter users based on search term', () => {
    const mockUsers = [
      { user_id: '123', user_name: 'TestUser', staff_id: '456', staff_name: 'StaffUser', reason: 'TestReason' },
      { user_id: '789', user_name: 'AnotherUser', staff_id: '101', staff_name: 'AnotherStaff', reason: 'AnotherReason' },
    ] as BlockedUser[];
    component['user_list'] = mockUsers;

    const event = { target: { value: 'Test' } } as unknown as Event;
    component['searchBlockedUser'](event);

    expect(component['filteredUsers']).toEqual([mockUsers[0]]);
  });

  it('should return all users if search term is empty', () => {
    const mockUsers = [
      { user_id: '123', user_name: 'TestUser', staff_id: '456', staff_name: 'StaffUser', reason: 'TestReason' },
      { user_id: '789', user_name: 'AnotherUser', staff_id: '101', staff_name: 'AnotherStaff', reason: 'AnotherReason' },
    ] as BlockedUser[];
    component['user_list'] = mockUsers;

    const event = { target: { value: '' } } as unknown as Event;
    component['searchBlockedUser'](event);

    expect(component['filteredUsers']).toEqual(mockUsers);
  });

  it('should handle case-insensitive search', () => {
    const mockUsers = [
      { user_id: '123', user_name: 'TestUser', staff_id: '456', staff_name: 'StaffUser', reason: 'TestReason' },
      { user_id: '789', user_name: 'AnotherUser', staff_id: '101', staff_name: 'AnotherStaff', reason: 'AnotherReason' },
    ] as BlockedUser[];
    component['user_list'] = mockUsers;

    const event = { target: { value: 'testuser' } } as unknown as Event;
    component['searchBlockedUser'](event);

    expect(component['filteredUsers']).toEqual([mockUsers[0]]);
  });

  it('should filter users by user_id, staff_id, user_name, staff_name, or reason', () => {
    const mockUsers = [
      { user_id: '123', user_name: 'TestUser', staff_id: '456', staff_name: 'StaffUser', reason: 'TestReason' },
      { user_id: '789', user_name: 'AnotherUser', staff_id: '101', staff_name: 'AnotherStaff', reason: 'AnotherReason' },
    ] as BlockedUser[];
    component['user_list'] = mockUsers;

    const event = { target: { value: 'AnotherReason' } } as unknown as Event;
    component['searchBlockedUser'](event);

    expect(component['filteredUsers']).toEqual([mockUsers[1]]);
  });

  it('should hide the modal when clicking outside of it', () => {
    const hideModalSpy = jest.spyOn(component.modal, 'hideModal');
    const mockEvent = { target: { id: 'roleModalContent' } } as unknown as MouseEvent;

    component.onDocumentClick(mockEvent);

    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should set the tableConfig button actions correctly', () => {
    const mockBlockedUser = { user_id: '123', user_name: 'TestUser' } as BlockedUser;
    const showModalSpy = jest.spyOn(component.modal, 'showModal');

    component['tableConfig'].action_btn[0].action(mockBlockedUser);

    expect(component['newBlockedUser']).toEqual(mockBlockedUser);
    expect(component['modalType']).toBe('BLOCKED_USER_EDIT');
    expect(showModalSpy).toHaveBeenCalled();

    // second branch: deleteBlockedUser
    const deleteBlockedUserSpy = jest.spyOn(component as any, 'deleteBlockedUser');
    component['tableConfig'].action_btn[1].action(mockBlockedUser);
    expect(deleteBlockedUserSpy).toHaveBeenCalled();
  });
});
