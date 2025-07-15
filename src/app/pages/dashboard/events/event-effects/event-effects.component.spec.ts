import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { EventEffectsComponent } from './event-effects.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {defer} from "rxjs";
import {Channel, Role} from "../../../../services/types/discord/Guilds";
import {EventCard, EventEffects, EventEffectsRaw} from "../../../../services/types/Events";
import {HttpErrorResponse} from "@angular/common/http";

describe('EventEffectsComponent', () => {
  let component: EventEffectsComponent;
  let fixture: ComponentFixture<EventEffectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventEffectsComponent, HttpClientTestingModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventEffectsComponent);
    component = fixture.componentInstance;
    component['dataService'].allowDataFetch.next(true); // Simulate data fetch allowed
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set dataLoading to false asynchronously when dataService.isLoading is false and dataLoading is true', fakeAsync(() => {
    component['dataService'].isLoading = false;
    component['dataLoading'] = true;
    localStorage.setItem('gift_effects', JSON.stringify({ channel_effects: [], role_effects: [] }));

    component.ngAfterViewChecked();
    tick();
    expect(component['dataLoading']).toBe(false);
  }));

  it('should not change dataLoading if dataService.isLoading is true', fakeAsync(() => {
    component['dataService'].isLoading = true;
    component['dataLoading'] = true;
    component.ngAfterViewChecked();
    tick();
    expect(component['dataLoading']).toBe(true);
  }));

  it('should not change dataLoading if dataLoading is already false', fakeAsync(() => {
    component['dataService'].isLoading = false;
    component['dataLoading'] = false;
    component.ngAfterViewChecked();
    tick();
    expect(component['dataLoading']).toBe(false);
  }));

  it('should set disabledCacheBtn to true', () => {
    component['disabledCacheBtn'] = false;
    jest.spyOn(component as any, 'getEventEffects');

    component['refreshCache']();
    expect(component['disabledCacheBtn']).toBe(true);
  });

  it('should set isLoading to true', () => {
    component['dataService'].isLoading = false;
    jest.spyOn(component as any, 'getEventEffects');

    component['refreshCache']();
    expect(component['dataService'].isLoading).toBe(true);
  });

  it('should call getEventEffects with true parameter', () => {
    const getEventEffectsSpy = jest.spyOn(component as any, 'getEventEffects');

    component['refreshCache']();
    expect(getEventEffectsSpy).toHaveBeenCalledWith(true);
  });

  it('should re-enable cache button after timeout', () => {
    jest.useFakeTimers();
    component['disabledCacheBtn'] = false;
    jest.spyOn(component as any, 'getEventEffects');

    component['refreshCache']();
    expect(component['disabledCacheBtn']).toBe(true);

    jest.advanceTimersByTime(15000);
    expect(component['disabledCacheBtn']).toBe(false);
    jest.useRealTimers();
  });

  it('should return early if no active guild is set', () => {
    component['dataService'].active_guild = null;
    component['dataService'].isLoading = false;

    component['getEventEffects'](false);

    expect(component['dataService'].isLoading).toBe(false);
  });

  it('should set isLoading to true at the beginning', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    component['dataService'].isLoading = false;
    jest.spyOn(component as any, 'mapEffectsToEventCards');

    component['getEventEffects'](true);

    expect(component['dataService'].isLoading).toBe(true);
  });

  it('should use cached data from localStorage when available and no_cache is false', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    const mockEffects = { channel_effects: [], role_effects: [] };
    const mockChannels = [{ id: '1', name: 'channel1' }];
    const mockRoles = [{ id: '1', name: 'role1' }];

    localStorage.setItem('gift_effects', JSON.stringify(mockEffects));
    localStorage.setItem('guild_channels', JSON.stringify(mockChannels));
    localStorage.setItem('guild_roles', JSON.stringify(mockRoles));
    localStorage.setItem('gift_effects_timestamp', (Date.now() - 30000).toString()); // 30 seconds ago

    const mapSpy = jest.spyOn(component as any, 'mapEffectsToEventCards');
    const apiSpy = jest.spyOn(component['apiService'], 'getEventEffects');

    component['getEventEffects'](false);

    expect(apiSpy).not.toHaveBeenCalled();
    expect(mapSpy).toHaveBeenCalledWith(mockEffects);
    expect(component['dataService'].guild_channels).toEqual(mockChannels);
    expect(component['dataService'].guild_roles).toEqual(mockRoles);
    expect(component['dataService'].isLoading).toBe(false);
  });

  it('should ignore cache when no_cache is true', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    const mockEffects = { channel_effects: [], role_effects: [] };

    localStorage.setItem('gift_effects', JSON.stringify(mockEffects));
    localStorage.setItem('guild_channels', JSON.stringify([]));
    localStorage.setItem('guild_roles', JSON.stringify([]));
    localStorage.setItem('gift_effects_timestamp', Date.now().toString());

    const apiSpy = jest.spyOn(component['apiService'], 'getEventEffects').mockReturnValue(defer(() => Promise.resolve({
      channel_effects: [],
      role_effects: [],
      guild_channels: [],
      guild_roles: []
    })));

    component['getEventEffects'](true);

    expect(apiSpy).toHaveBeenCalledWith('123');
  });

  it('should ignore cache when cache is expired', () => {
    component['dataService'].active_guild = { id: '123' } as any;

    localStorage.setItem('gift_effects', JSON.stringify({}));
    localStorage.setItem('guild_channels', JSON.stringify([]));
    localStorage.setItem('guild_roles', JSON.stringify([]));
    localStorage.setItem('gift_effects_timestamp', (Date.now() - 70000).toString()); // 70 seconds ago

    const apiSpy = jest.spyOn(component['apiService'], 'getEventEffects').mockReturnValue(defer(() => Promise.resolve({
      channel_effects: [],
      role_effects: [],
      guild_channels: [],
      guild_roles: []
    })));

    component['getEventEffects'](false);

    expect(apiSpy).toHaveBeenCalledWith('123');
  });

  it('should fetch data from API and update localStorage on success', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as any;
    const mockResponse: EventEffectsRaw = {
      channel_effects: [{ guild_id: '123', channel_id: 'ch1', category: 0 }],
      role_effects: [{ guild_id: '123', role_id: 'r1', category: 0 }],
      guild_channels: [{ id: 'ch1', name: 'channel1' }] as Channel[],
      guild_roles: [{ id: 'r1', name: 'role1' }] as Role[]
    };

    localStorage.removeItem('gift_effects');
    localStorage.removeItem('guild_channels');
    localStorage.removeItem('guild_roles');
    localStorage.removeItem('gift_effects_timestamp');

    jest.spyOn(component['apiService'], 'getEventEffects').mockReturnValue(defer(() => Promise.resolve(mockResponse)));
    const mapSpy = jest.spyOn(component as any, 'mapEffectsToEventCards');

    component['getEventEffects'](false);
    tick();

    expect(component['dataService'].guild_channels).toEqual(mockResponse.guild_channels);
    expect(component['dataService'].guild_roles).toEqual(mockResponse.guild_roles);
    expect(mapSpy).toHaveBeenCalledWith({ channel_effects: mockResponse.channel_effects, role_effects: mockResponse.role_effects });
    expect(component['dataService'].isLoading).toBe(false);

    expect(localStorage.getItem('gift_effects')).toBeTruthy();
    expect(localStorage.getItem('guild_channels')).toBeTruthy();
    expect(localStorage.getItem('guild_roles')).toBeTruthy();
    expect(localStorage.getItem('gift_effects_timestamp')).toBeTruthy();
  }));

  it('should handle API error with status 429', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as any;
    const error = new HttpErrorResponse({ status: 429 });

    jest.spyOn(component['apiService'], 'getEventEffects').mockReturnValue(defer(() => Promise.reject(error)));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    component['getEventEffects'](true);
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle API error with status 0', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as any;
    const error = new HttpErrorResponse({ status: 0 });

    jest.spyOn(component['apiService'], 'getEventEffects').mockReturnValue(defer(() => Promise.reject(error)));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    component['getEventEffects'](true);
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
  }));

  it('should handle other API errors', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as any;
    const error = new HttpErrorResponse({ status: 500 });

    jest.spyOn(component['apiService'], 'getEventEffects').mockReturnValue(defer(() => Promise.reject(error)));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    component['getEventEffects'](true);
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  }));

  it('should return early if no active guild is set when saving effects', () => {
    component['dataService'].active_guild = null;
    const convertToEffectsSpy = jest.spyOn(component as any, 'convertToEffects');
    const apiSpy = jest.spyOn(component['apiService'], 'saveEventEffects');

    component['saveEventEffects']([]);

    expect(convertToEffectsSpy).not.toHaveBeenCalled();
    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should return early if no event cards are provided', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    const convertToEffectsSpy = jest.spyOn(component as any, 'convertToEffects');
    const apiSpy = jest.spyOn(component['apiService'], 'saveEventEffects');

    component['saveEventEffects'](null as any);

    expect(convertToEffectsSpy).not.toHaveBeenCalled();
    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should convert event cards to effects and call API service', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    const mockEffects = { channel_effects: [], role_effects: [] };

    jest.spyOn(component as any, 'convertToEffects').mockReturnValue(mockEffects);
    const apiSpy = jest.spyOn(component['apiService'], 'saveEventEffects')
      .mockReturnValue(defer(() => Promise.resolve({})));

    component['saveEventEffects']([]);

    expect(component['disableSendBtn']).toBe(true);
    expect(apiSpy).toHaveBeenCalledWith(mockEffects, '123');
  });

  it('should handle successful API response', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as any;
    const mockEffects = { channel_effects: [], role_effects: [] };

    jest.spyOn(component as any, 'convertToEffects').mockReturnValue(mockEffects);
    jest.spyOn(component['apiService'], 'saveEventEffects')
      .mockReturnValue(defer(() => Promise.resolve({})));

    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');
    localStorage.removeItem('gift_effects');

    component['saveEventEffects']([]);
    tick();

    expect(component['dataService'].error_color).toBe('green');
    expect(showAlertSpy).toHaveBeenCalled();
    expect(localStorage.getItem('gift_effects')).toEqual(JSON.stringify(mockEffects));
    expect(component['org_event_cards']).toEqual(component['event_cards']);

    // Button should still be disabled after immediate execution
    expect(component['disableSendBtn']).toBe(true);

    // Button should be re-enabled after 5 seconds
    tick(5001);
    expect(component['disableSendBtn']).toBe(false);
  }));

  it('should handle API error with status 429', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as any;
    const error = new HttpErrorResponse({ status: 429 });

    jest.spyOn(component as any, 'convertToEffects');
    jest.spyOn(component['apiService'], 'saveEventEffects')
      .mockReturnValue(defer(() => Promise.reject(error)));

    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    component['saveEventEffects']([]);
    tick();

    expect(component['dataService'].error_color).toBe('red');
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(component['disableSendBtn']).toBe(true); // Should still be disabled because of early return
  }));

  it('should handle other API errors', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as any;
    const error = new HttpErrorResponse({ status: 500 });

    jest.spyOn(component as any, 'convertToEffects');
    jest.spyOn(component['apiService'], 'saveEventEffects')
      .mockReturnValue(defer(() => Promise.reject(error)));

    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['saveEventEffects']([]);
    tick();

    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalled();
    expect(component['disableSendBtn']).toBe(false); // Should be re-enabled for other errors
  }));

  it('should convert empty event cards to empty effects object', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    component['event_cards'] = [];

    const effects = component['convertToEffects']();

    expect(effects.channel_effects).toEqual([]);
    expect(effects.role_effects).toEqual([]);
  });

  it('should convert role type event cards to role effects', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    const mockRole1 = { id: 'r1', name: 'role1', hoist: true, color: 0 } as Role;
    const mockRole2 = { id: 'r2', name: 'role2', hoist: false, color: 0 } as Role;

    component['event_cards'] = [
      { title: 'Card1', obj_list: [mockRole1, mockRole2] } as EventCard,
      {title: 'Card2', obj_list: []} as unknown as EventCard
    ];

    jest.spyOn(component as any, 'isRoleType').mockReturnValue(true);

    const effects = component['convertToEffects']();

    expect(effects.role_effects).toEqual([
      { guild_id: '123', role_id: 'r1', category: 0 },
      { guild_id: '123', role_id: 'r2', category: 0 }
    ]);
    expect(effects.channel_effects).toEqual([]);
  });

  it('should convert channel type event cards to channel effects', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    const mockChannel1 = { id: 'ch1', name: 'channel1', position: 0 } as Channel;
    const mockChannel2 = { id: 'ch2', name: 'channel2', position: 1 } as Channel;

    component['event_cards'] = [
      {title: 'Card1', obj_list: []} as unknown as EventCard,
      {title: 'Card2', obj_list: []} as unknown as EventCard,
      {title: 'Card3', obj_list: []} as unknown as EventCard,
      {title: 'Card4', obj_list: []} as unknown as EventCard,
      {title: 'Card5', obj_list: []} as unknown as EventCard,
      {title: 'Card6', obj_list: []} as unknown as EventCard,
      { title: 'Blacklisted', obj_list: [mockChannel1] } as EventCard,
      { title: 'Invite log', obj_list: [mockChannel2] } as EventCard
    ];

    jest.spyOn(component as any, 'isRoleType').mockReturnValue(false);

    const effects = component['convertToEffects']();

    expect(effects.channel_effects).toEqual([
      { guild_id: '123', channel_id: 'ch1', category: 0 },
      { guild_id: '123', channel_id: 'ch2', category: 6 }
    ]);
    expect(effects.role_effects).toEqual([]);
  });

  it('should handle mixed role and channel event cards', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    const mockRole = { id: 'r1', name: 'role1', hoist: true, color: 0 } as Role;
    const mockChannel = { id: 'ch1', name: 'channel1', position: 0 } as Channel;

    component['event_cards'] = [
      { title: 'Card1', obj_list: [mockRole] } as EventCard,
      {title: 'Card2', obj_list: []} as unknown as EventCard,
      {title: 'Card3', obj_list: []} as unknown as EventCard,
      {title: 'Card4', obj_list: []} as unknown as EventCard,
      {title: 'Card5', obj_list: []} as unknown as EventCard,
      {title: 'Card6', obj_list: []} as unknown as EventCard,
      { title: 'Blacklisted', obj_list: [mockChannel] } as EventCard
    ];

    const isRoleTypeSpy = jest.spyOn(component as any, 'isRoleType');
    isRoleTypeSpy.mockImplementation((value) => value === mockRole);

    const effects = component['convertToEffects']();

    expect(effects.role_effects).toEqual([{ guild_id: '123', role_id: 'r1', category: 0 }]);
    expect(effects.channel_effects).toEqual([{ guild_id: '123', channel_id: 'ch1', category: 0 }]);
  });

  it('should skip event cards with empty object lists', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    const mockRole = { id: 'r1', name: 'role1', hoist: true, color: 0 } as Role;

    component['event_cards'] = [
      {title: 'Card1', obj_list: []} as unknown as EventCard,
      { title: 'Card2', obj_list: [mockRole] } as EventCard,
      {title: 'Card3', obj_list: []} as unknown as EventCard
    ];

    jest.spyOn(component as any, 'isRoleType').mockReturnValue(true);

    const effects = component['convertToEffects']();

    expect(effects.role_effects).toEqual([{ guild_id: '123', role_id: 'r1', category: 1 }]);
    expect(effects.channel_effects).toEqual([]);
  });

  it('should add role to card object list when activeTab is ROLES', () => {
    component['activeTab'] = 'ROLES';
    const role = { id: 'role1', name: 'Role 1', position: 2, hoist: true, color: 0 } as Role;
    const card = { title: 'Card', obj_list: [] as Role[] } as EventCard;

    jest.spyOn(component['dataService'].guild_roles, 'find').mockReturnValue(role);
    jest.spyOn(component['dataService'], 'showAlert');
    jest.spyOn(component['translate'], 'instant');
    jest.spyOn(component['markdownPipe'], 'transform');

    component['pushToCardList']('role1', card);

    expect(card.obj_list).toContain(role);
    expect(component['dataService'].error_color).toBe('green');
    expect(component['dataService'].showAlert).toHaveBeenCalled();
  });

  it('should sort roles by position when adding to card', () => {
    component['activeTab'] = 'ROLES';
    const role1 = { id: 'role1', name: 'Role 1', position: 2, hoist: true, color: 0 } as Role;
    const role2 = { id: 'role2', name: 'Role 2', position: 5, hoist: true, color: 0 } as Role;
    const card = { title: 'Card', obj_list: [role1] as Role[] } as EventCard;

    jest.spyOn(component['dataService'].guild_roles, 'find').mockReturnValue(role2);
    jest.spyOn(component['dataService'], 'showAlert');

    component['pushToCardList']('role2', card);

    expect(card.obj_list[0]).toBe(role2); // Higher position comes first
    expect(card.obj_list[1]).toBe(role1);
  });

  it('should remove role from card object list when remove flag is true', () => {
    component['activeTab'] = 'ROLES';
    const role = { id: 'role1', name: 'Role 1', position: 2, hoist: true, color: 0 } as Role;
    const card = { title: 'Card', obj_list: [role] as Role[] } as EventCard;

    jest.spyOn(component['dataService'].guild_roles, 'find').mockReturnValue(role);
    jest.spyOn(component['dataService'], 'showAlert');

    component['pushToCardList']('role1', card, true);

    expect(card.obj_list).not.toContain(role);
    expect(card.obj_list.length).toBe(0);
  });

  it('should add channel to card object list when activeTab is CHANNELS', () => {
    component['activeTab'] = 'CHANNELS';
    const channel = { id: 'channel1', name: 'Channel 1', position: 2 } as Channel;
    const card = { title: 'Card', obj_list: [] as Channel[] } as EventCard;

    jest.spyOn(component['dataService'].guild_channels, 'find').mockReturnValue(channel);
    jest.spyOn(component['dataService'], 'showAlert');

    component['pushToCardList']('channel1', card);

    expect(card.obj_list).toContain(channel);
  });

  it('should sort channels by position when adding to card', () => {
    component['activeTab'] = 'CHANNELS';
    const channel1 = { id: 'channel1', name: 'Channel 1', position: 2 } as Channel;
    const channel2 = { id: 'channel2', name: 'Channel 2', position: 5 } as Channel;
    const card = { title: 'Card', obj_list: [channel1] as Channel[] } as EventCard;

    jest.spyOn(component['dataService'].guild_channels, 'find').mockReturnValue(channel2);
    jest.spyOn(component['dataService'], 'showAlert');

    component['pushToCardList']('channel2', card);

    expect(card.obj_list[0]).toBe(channel2); // Higher position comes first
    expect(card.obj_list[1]).toBe(channel1);
  });

  it('should remove channel from card object list when remove flag is true', () => {
    component['activeTab'] = 'CHANNELS';
    const channel = { id: 'channel1', name: 'Channel 1', position: 2 } as Channel;
    const card = { title: 'Card', obj_list: [channel] as Channel[] } as EventCard;

    jest.spyOn(component['dataService'].guild_channels, 'find').mockReturnValue(channel);
    jest.spyOn(component['dataService'], 'showAlert');

    component['pushToCardList']('channel1', card, true);

    expect(card.obj_list).not.toContain(channel);
    expect(card.obj_list.length).toBe(0);
  });

  it('should replace channel list with a single channel when card title is EVENTS_TAB_INVITE_TITLE', () => {
    component['activeTab'] = 'CHANNELS';
    const channel1 = { id: 'channel1', name: 'Channel 1', position: 2 } as Channel;
    const channel2 = { id: 'channel2', name: 'Channel 2', position: 5 } as Channel;
    const card = { title: 'EVENTS_TAB_INVITE_TITLE', obj_list: [channel1] as Channel[] } as EventCard;
    component['dataService'].guild_channels = [channel2];

    jest.spyOn(component['dataService'], 'showAlert');

    component['pushToCardList']('channel2', card);

    expect(card.obj_list.length).toBe(1);
    expect(card.obj_list[0]).toBe(channel2);
    expect(card.obj_list).not.toContain(channel1);
  });

  it('should show proper alert message with markdown transformation', () => {
    component['activeTab'] = 'ROLES';
    const role = { id: 'role1', name: '**Bold Role**', position: 2, hoist: true, color: 0 } as Role;
    const card = { title: 'CARD_TITLE', obj_list: [] as Role[] } as EventCard;
    component['dataService'].guild_roles = [role];

    jest.spyOn(component['dataService'], 'showAlert');
    jest.spyOn(component['translate'], 'instant').mockImplementation((key, params) => {
      if (key === 'SUCCESS_EFFECTS_ROLES_TITLE') return 'Success Title';
      if (key === 'SUCCESS_EFFECTS_ROLES_DESC') return 'Success Description';
      if (key === 'CARD_TITLE') return 'Card ~ Type';
      return key;
    });
    jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('<strong>Bold Role</strong>');

    component['pushToCardList']('role1', card);

    expect(component['dataService'].showAlert).toHaveBeenCalledWith(
      'Success Title',
      'Success Description'
    );
    expect(component['markdownPipe'].transform).toHaveBeenCalledWith('**Bold Role**');
  });

  it('should show proper alert message for deletion', () => {
    component['activeTab'] = 'CHANNELS';
    const channel = { id: 'channel1', name: 'Channel 1', position: 2 } as Channel;
    const card = { title: 'CARD_TITLE', obj_list: [channel] as Channel[] } as EventCard;

    jest.spyOn(component['dataService'].guild_channels, 'find').mockReturnValue(channel);
    jest.spyOn(component['dataService'], 'showAlert');
    jest.spyOn(component['translate'], 'instant').mockImplementation((key, params) => {
      if (key === 'SUCCESS_EFFECTS_CHANNELS_DELETE_TITLE') return 'Delete Title';
      if (key === 'SUCCESS_EFFECTS_CHANNELS_DELETE_DESC') return 'Delete Description';
      if (key === 'CARD_TITLE') return 'Card ~ Type';
      return key;
    });

    component['pushToCardList']('channel1', card, true);

    expect(component['dataService'].showAlert).toHaveBeenCalledWith(
      'Delete Title',
      'Delete Description'
    );
  });

  it('should handle the case when role is not found', () => {
    component['activeTab'] = 'ROLES';
    const card = { title: 'Card', obj_list: [] as Role[] } as EventCard;

    jest.spyOn(component['dataService'].guild_roles, 'find').mockReturnValue(undefined);
    jest.spyOn(component['dataService'], 'showAlert');

    component['pushToCardList']('nonexistent', card);

    expect(card.obj_list.length).toBe(0);
    expect(component['dataService'].error_color).toBe('green');
    expect(component['dataService'].showAlert).toHaveBeenCalled();
  });

  it('should handle the case when channel is not found', () => {
    component['activeTab'] = 'CHANNELS';
    const card = { title: 'Card', obj_list: [] as Channel[] } as EventCard;

    jest.spyOn(component['dataService'].guild_channels, 'find').mockReturnValue(undefined);
    jest.spyOn(component['dataService'], 'showAlert');

    component['pushToCardList']('nonexistent', card);

    expect(card.obj_list.length).toBe(0);
    expect(component['dataService'].error_color).toBe('green');
    expect(component['dataService'].showAlert).toHaveBeenCalled();
  });

  it('should return roles that are not in the card\'s object list when activeTab is ROLES', () => {
    component['activeTab'] = 'ROLES';
    const role1 = { id: 'role1', name: 'Role 1' } as Role;
    const role2 = { id: 'role2', name: 'Role 2' } as Role;
    const role3 = { id: 'role3', name: 'Role 3' } as Role;

    component['dataService'].guild_roles = [role1, role2, role3];
    const card = { title: 'Card', obj_list: [role1] as Role[] } as EventCard;

    const result = component['excludeFromSelect'](card);

    expect(result.length).toBe(2);
    expect(result).toContain(role2);
    expect(result).toContain(role3);
    expect(result).not.toContain(role1);
  });

  it('should return channels that are not in the card\'s object list when activeTab is CHANNELS', () => {
    component['activeTab'] = 'CHANNELS';
    const channel1 = { id: 'channel1', name: 'Channel 1' } as Channel;
    const channel2 = { id: 'channel2', name: 'Channel 2' } as Channel;

    component['dataService'].guild_channels = [channel1, channel2];
    const card = { title: 'Card', obj_list: [channel1] as Channel[] } as EventCard;

    const result = component['excludeFromSelect'](card);

    expect(result.length).toBe(1);
    expect(result).toContain(channel2);
    expect(result).not.toContain(channel1);
  });

  it('should filter out non-text channels when card title is EVENTS_TAB_INVITE_TITLE', () => {
    component['activeTab'] = 'CHANNELS';
    const textChannel = { id: 'text1', name: 'Text Channel' } as Channel;
    const voiceChannel = { id: 'voice1', name: 'Voice Channel' } as Channel;

    component['dataService'].guild_channels = [textChannel, voiceChannel];
    component['dataService'].isTextChannel = jest.fn().mockImplementation((channel) => channel === textChannel);

    const card = { title: 'EVENTS_TAB_INVITE_TITLE', obj_list: [] as Channel[] } as EventCard;

    const result = component['excludeFromSelect'](card);

    expect(result.length).toBe(1);
    expect(result).toContain(textChannel);
    expect(result).not.toContain(voiceChannel);
    expect(component['dataService'].isTextChannel).toHaveBeenCalledWith(textChannel);
    expect(component['dataService'].isTextChannel).toHaveBeenCalledWith(voiceChannel);
  });

  it('should return empty array when all roles are already in the card\'s object list', () => {
    component['activeTab'] = 'ROLES';
    const role1 = { id: 'role1', name: 'Role 1' } as Role;
    const role2 = { id: 'role2', name: 'Role 2' } as Role;

    component['dataService'].guild_roles = [role1, role2];
    const card = { title: 'Card', obj_list: [role1, role2] as Role[] } as EventCard;

    const result = component['excludeFromSelect'](card);

    expect(result.length).toBe(0);
  });

  it('should return empty array when all channels are already in the card\'s object list', () => {
    component['activeTab'] = 'CHANNELS';
    const channel1 = { id: 'channel1', name: 'Channel 1' } as Channel;
    const channel2 = { id: 'channel2', name: 'Channel 2' } as Channel;

    component['dataService'].guild_channels = [channel1, channel2];
    const card = { title: 'Card', obj_list: [channel1, channel2] as Channel[] } as EventCard;

    const result = component['excludeFromSelect'](card);

    expect(result.length).toBe(0);
  });

  it('should reset all card object lists at the beginning', () => {
    const mockCard = { title: 'Card', obj_list: [{ id: '1' }] } as EventCard;
    component['event_cards'] = [mockCard];

    component['mapEffectsToEventCards']({ channel_effects: [], role_effects: [] });

    expect(mockCard.obj_list).toEqual([]);
  });

  it('should create maps for roles and channels for faster lookups', () => {
    const role = { id: 'role1', name: 'Role 1', position: 2 } as Role;
    const channel = { id: 'channel1', name: 'Channel 1' } as Channel;

    component['dataService'].guild_roles = [role];
    component['dataService'].guild_channels = [channel];

    const setMapSpy = jest.spyOn(Map.prototype, 'set');

    component['mapEffectsToEventCards']({ channel_effects: [], role_effects: [] });

    expect(setMapSpy).toHaveBeenCalledWith('role1', role);
    expect(setMapSpy).toHaveBeenCalledWith('channel1', channel);
  });

  it('should map role effects to the corresponding event cards', () => {
    const role = { id: 'role1', name: 'Role 1', position: 2 } as Role;
    component['dataService'].guild_roles = [role];

    const effects: EventEffects = {
      role_effects: [{ guild_id: '123', role_id: 'role1', category: 1 }],
      channel_effects: []
    };

    component['event_cards'] = Array(6).fill(null).map(() => ({title: '', obj_list: []}) as unknown as EventCard);

    component['mapEffectsToEventCards'](effects);

    expect(component['event_cards'][1].obj_list).toContain(role);
  });

  it('should sort roles by position in descending order', () => {
    const role1 = { id: 'role1', name: 'Role 1', position: 2 } as Role;
    const role2 = { id: 'role2', name: 'Role 2', position: 5 } as Role;
    const role3 = { id: 'role3', name: 'Role 3', position: 3 } as Role;

    component['dataService'].guild_roles = [role1, role2, role3];

    const effects: EventEffects = {
      role_effects: [
        { guild_id: '123', role_id: 'role1', category: 0 },
        { guild_id: '123', role_id: 'role2', category: 0 },
        { guild_id: '123', role_id: 'role3', category: 0 }
      ],
      channel_effects: []
    };

    component['event_cards'] = Array(6).fill(null).map(() => ({title: '', obj_list: []}) as unknown as EventCard);

    component['mapEffectsToEventCards'](effects);

    expect(component['event_cards'][0].obj_list[0]).toBe(role2); // highest position
    expect(component['event_cards'][0].obj_list[1]).toBe(role3);
    expect(component['event_cards'][0].obj_list[2]).toBe(role1); // lowest position
  });

  it('should skip role effects with non-existent roles', () => {
    component['dataService'].guild_roles = [];

    const effects: EventEffects = {
      role_effects: [{ guild_id: '123', role_id: 'nonexistent', category: 0 }],
      channel_effects: []
    };

    component['event_cards'] = Array(6).fill(null).map(() => ({title: '', obj_list: []}) as unknown as EventCard);

    component['mapEffectsToEventCards'](effects);

    expect(component['event_cards'][0].obj_list).toEqual([]);
  });

  it('should skip role effects with out-of-bounds category', () => {
    const role = { id: 'role1', name: 'Role 1', position: 2 } as Role;
    component['dataService'].guild_roles = [role];

    const effects: EventEffects = {
      role_effects: [{ guild_id: '123', role_id: 'role1', category: 10 as any }],
      channel_effects: []
    };

    component['event_cards'] = Array(6).fill(null).map(() => ({title: '', obj_list: []}) as unknown as EventCard);

    component['mapEffectsToEventCards'](effects);

    // All cards should have empty object lists
    expect(component['event_cards'].every(card => card.obj_list.length === 0)).toBeTruthy();
  });

  it('should map channel effects according to the category mapping', () => {
    const channel = { id: 'channel1', name: 'Channel 1', position: 1 } as Channel;
    component['dataService'].guild_channels = [channel];

    const effects: EventEffects = {
      role_effects: [],
      channel_effects: [
        { guild_id: '123', channel_id: 'channel1', category: 0 } // Should map to index 6
      ]
    };

    component['event_cards'] = Array(8).fill(null).map(() => ({title: '', obj_list: []}) as unknown as EventCard);

    component['mapEffectsToEventCards'](effects);

    expect(component['event_cards'][6].obj_list).toContain(channel);
  });

  it('should map invite log channel effects to event card at index 7', () => {
    const channel = { id: 'channel1', name: 'Channel 1', position: 1 } as Channel;
    component['dataService'].guild_channels = [channel];

    const effects: EventEffects = {
      role_effects: [],
      channel_effects: [
        { guild_id: '123', channel_id: 'channel1', category: 6 } // Should map to index 7 (Invite log)
      ]
    };

    component['event_cards'] = Array(8).fill(null).map(() => ({title: '', obj_list: []}) as unknown as EventCard);

    component['mapEffectsToEventCards'](effects);

    expect(component['event_cards'][7].obj_list).toContain(channel);
  });

  it('should sort channels by position in descending order', () => {
    const channel1 = { id: 'channel1', name: 'Channel 1', position: 2 } as Channel;
    const channel2 = { id: 'channel2', name: 'Channel 2', position: 5 } as Channel;
    const channel3 = { id: 'channel3', name: 'Channel 3', position: 3 } as Channel;

    component['dataService'].guild_channels = [channel1, channel2, channel3];

    const effects: EventEffects = {
      role_effects: [],
      channel_effects: [
        { guild_id: '123', channel_id: 'channel1', category: 0 },
        { guild_id: '123', channel_id: 'channel2', category: 0 },
        { guild_id: '123', channel_id: 'channel3', category: 0 }
      ]
    };

    component['event_cards'] = Array(8).fill(null).map(() => ({title: '', obj_list: []}) as unknown as EventCard);

    component['mapEffectsToEventCards'](effects);

    expect(component['event_cards'][6].obj_list[0]).toBe(channel2); // highest position
    expect(component['event_cards'][6].obj_list[1]).toBe(channel3);
    expect(component['event_cards'][6].obj_list[2]).toBe(channel1); // lowest position
  });

  it('should skip channel effects with non-existent channels', () => {
    component['dataService'].guild_channels = [];

    const effects: EventEffects = {
      role_effects: [],
      channel_effects: [{ guild_id: '123', channel_id: 'nonexistent', category: 0 }]
    };

    component['event_cards'] = Array(8).fill(null).map(() => ({title: '', obj_list: []}) as unknown as EventCard);

    component['mapEffectsToEventCards'](effects);

    expect(component['event_cards'][6].obj_list).toEqual([]);
  });

  it('should skip channel effects with unmapped category', () => {
    const channel = { id: 'channel1', name: 'Channel 1', position: 1 } as Channel;
    component['dataService'].guild_channels = [channel];

    const effects: EventEffects = {
      role_effects: [],
      channel_effects: [{ guild_id: '123', channel_id: 'channel1', category: 2 as any }]
    };

    component['event_cards'] = Array(8).fill(null).map(() => ({title: '', obj_list: []}) as unknown as EventCard);

    component['mapEffectsToEventCards'](effects);

    // All cards should have empty object lists
    expect(component['event_cards'].every(card => card.obj_list.length === 0)).toBeTruthy();
  });

  it('should update the original event cards after mapping', () => {
    const role = { id: 'role1', name: 'Role 1', position: 2 } as Role;
    component['dataService'].guild_roles = [role];

    const effects: EventEffects = {
      role_effects: [{ guild_id: '123', role_id: 'role1', category: 1 }],
      channel_effects: []
    };

    component['event_cards'] = Array(6).fill(null).map(() => ({title: '', obj_list: []}) as unknown as EventCard);
    component['org_event_cards'] = [];

    component['mapEffectsToEventCards'](effects);

    expect(JSON.stringify(component['org_event_cards'])).toBe(JSON.stringify(component['event_cards']));
  });

  it('should correctly identify a Role object', () => {
    const role = { id: '123', name: 'Test Role', hoist: true, color: 0 } as Role;
    expect(component['isRoleType'](role)).toBe(true);
  });

  it('should correctly identify a Channel object as not a Role', () => {
    const channel = { id: '123', name: 'Test Channel', position: 0 } as Channel;
    expect(component['isRoleType'](channel)).toBe(false);
  });

  it('should handle null value correctly', () => {
    expect(component['isRoleType'](null as any)).toBe(false);
  });

  it('should handle objects with partial Role properties correctly', () => {
    const partialRole = { id: '123', name: 'Partial Role', hoist: true } as any;
    expect(component['isRoleType'](partialRole)).toBe(false);

    const otherPartialRole = { id: '123', name: 'Other Partial', color: 0 } as any;
    expect(component['isRoleType'](otherPartialRole)).toBe(false);
  });

  it('should correctly identify a complete object with both required properties', () => {
    const customObject = { id: '123', name: 'Custom', hoist: false, color: 12345, extraProp: true } as any;
    expect(component['isRoleType'](customObject)).toBe(true);
  });

  it('should return true if event_cards and org_event_cards are different', () => {
    component['event_cards'] = [{ title: 'Card1', obj_list: [] }] as any;
    component['org_event_cards'] = [{ title: 'Card2', obj_list: [] }] as any;
    expect(component.isCardListChanged()).toBe(true);
  });

  it('should return false if event_cards and org_event_cards are equal', () => {
    const cards = [{ title: 'Card1', obj_list: [] }];
    component['event_cards'] = JSON.parse(JSON.stringify(cards));
    component['org_event_cards'] = JSON.parse(JSON.stringify(cards));
    expect(component.isCardListChanged()).toBe(false);
  });

  it('should return true if event_cards and org_event_cards have same titles but different obj_list', () => {
    component['event_cards'] = [{ title: 'Card1', obj_list: [{ id: '1' }] }] as any;
    component['org_event_cards'] = [{ title: 'Card1', obj_list: [] }] as any;
    expect(component.isCardListChanged()).toBe(true);
  });

  it('should return false if both event_cards and org_event_cards are empty arrays', () => {
    component['event_cards'] = [];
    component['org_event_cards'] = [];
    expect(component.isCardListChanged()).toBe(false);
  });
});
