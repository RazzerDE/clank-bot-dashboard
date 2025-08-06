import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { GlobalChatComponent } from './global-chat.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {GlobalChatConfig, GlobalChatConfigDetails} from "../../../../services/types/Misc";
import {defer} from "rxjs";

describe('GlobalChatComponent', () => {
  let component: GlobalChatComponent;
  let fixture: ComponentFixture<GlobalChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalChatComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    jest.spyOn(component as any, 'getGlobalChat').mockImplementation();

    component['dataService'].allowDataFetch.next(true);
    expect(component['getGlobalChat']).toHaveBeenCalled();
  });

  it('should set channel_id if global_config exists', () => {
    component['global_chat'].global_config = { channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };

    component['saveGlobalChat']('12345');

    expect(component['global_chat'].global_config?.channel_id).toBe('12345');
  });

  it('should create global_config if it does not exist', () => {
    component['global_chat'].global_config = undefined as any;
    component['saveGlobalChat']('67890');
    expect(component['global_chat'].global_config?.channel_id).toBe('67890');
    expect(component['global_chat'].global_config?.message_count).toBe(0);
    expect(component['global_chat'].global_config?.lock_reason).toBeNull();
    expect(component['global_chat'].global_config?.bot_name).toBeNull();
    expect(component['global_chat'].global_config?.bot_avatar_url).toBeNull();
    expect(component['global_chat'].global_config?.invite).toBeNull();
    expect(typeof component['global_chat'].global_config?.created_at).toBe('number');
  });

  it('should return false if channel_id is unchanged', () => {
    component['org_global_chat'].global_config = { channel_id: 'abc', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    component['global_chat'].global_config = { channel_id: 'abc', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    expect(component['hasChatChanges']()).toBe(false);
  });

  it('should return true if channel_id is changed', () => {
    component['org_global_chat'].global_config = { channel_id: 'abc', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    component['global_chat'].global_config = { channel_id: 'def', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    expect(component['hasChatChanges']()).toBe(true);
  });

  it('should handle undefined channel_id correctly', () => {
    component['org_global_chat'].global_config = { channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    component['global_chat'].global_config = { channel_id: 'def', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    expect(component['hasChatChanges']()).toBe(true);
  });

  it('should handle both channel_id undefined', () => {
    component['org_global_chat'].global_config = { channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    component['global_chat'].global_config = { channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    expect(component['hasChatChanges']()).toBe(false);
  });

  it('should return false if bot_name, bot_avatar_url and global_desc are unchanged', () => {
    component['org_global_chat'].global_config = { bot_name: 'Bot', bot_avatar_url: 'url', channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, invite: null };
    component['global_chat'].global_config = { bot_name: 'Bot', bot_avatar_url: 'url', channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, invite: null };
    component['org_global_chat'].global_desc = 'desc';
    component['global_chat'].global_desc = 'desc';
    expect(component['hasCustomizeChanges']()).toBe(false);
  });

  it('should return true if bot_name is changed', () => {
    component['org_global_chat'].global_config = { bot_name: 'Bot', bot_avatar_url: 'url', channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, invite: null };
    component['global_chat'].global_config = { bot_name: 'OtherBot', bot_avatar_url: 'url', channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, invite: null };
    component['org_global_chat'].global_desc = 'desc';
    component['global_chat'].global_desc = 'desc';
    expect(component['hasCustomizeChanges']()).toBe(true);
  });

  it('should return true if bot_avatar_url is changed', () => {
    component['org_global_chat'].global_config = { bot_name: 'Bot', bot_avatar_url: 'url1', channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, invite: null };
    component['global_chat'].global_config = { bot_name: 'Bot', bot_avatar_url: 'url2', channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, invite: null };
    component['org_global_chat'].global_desc = 'desc';
    component['global_chat'].global_desc = 'desc';
    expect(component['hasCustomizeChanges']()).toBe(true);
  });

  it('should return true if global_desc is changed', () => {
    component['org_global_chat'].global_config = { bot_name: 'Bot', bot_avatar_url: 'url', channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, invite: null };
    component['global_chat'].global_config = { bot_name: 'Bot', bot_avatar_url: 'url', channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, invite: null };
    component['org_global_chat'].global_desc = 'desc1';
    component['global_chat'].global_desc = 'desc2';
    expect(component['hasCustomizeChanges']()).toBe(true);
  });

  it('should handle undefined bot_name, bot_avatar_url and global_desc', () => {
    component['org_global_chat'].global_config = { bot_name: null, bot_avatar_url: null, channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, invite: null };
    component['global_chat'].global_config = { bot_name: null, bot_avatar_url: null, channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, invite: null };
    component['org_global_chat'].global_desc = null;
    component['global_chat'].global_desc = null;
    expect(component['hasCustomizeChanges']()).toBe(false);
  });

  it('should disable the button, set loading, call getGlobalChat and re-enable after 15s', fakeAsync(() => {
    const button = document.createElement('button');
    button.disabled = false;
    component['dataService'].isLoading = false;

    const getGlobalChatSpy = jest.spyOn(component as any, 'getGlobalChat').mockImplementation();

    component['refreshCache'](button);

    expect(button.disabled).toBe(true);
    expect(component['dataService'].isLoading).toBe(true);
    expect(getGlobalChatSpy).toHaveBeenCalledWith(true);

    tick(15000);
    expect(button.disabled).toBe(false);
  }));

  it('should set bot_avatar_url to null and isInvalidAvatar to false if input is empty', () => {
    const event = { target: { value: '' } } as unknown as Event;
    component['global_chat'].global_config = { ...component['global_chat'].global_config, bot_avatar_url: 'oldUrl' } as GlobalChatConfigDetails;
    component['isInvalidAvatar'] = false;

    component['verifyAvatarURL'](event);

    expect(component['global_chat'].global_config!.bot_avatar_url).toBeNull();
    expect(component['isInvalidAvatar']).toBe(false);
  });

  it('should set bot_avatar_url to null and isInvalidAvatar to true if url is invalid', () => {
    const event = { target: { value: 'ftp://invalid-url.txt' } } as unknown as Event;
    component['global_chat'].global_config = { ...component['global_chat'].global_config, bot_avatar_url: 'oldUrl' } as GlobalChatConfigDetails;
    component['isInvalidAvatar'] = false;

    component['verifyAvatarURL'](event);

    expect(component['global_chat'].global_config!.bot_avatar_url).toBeNull();
    expect(component['isInvalidAvatar']).toBe(true);
  });

  it('should set bot_avatar_url to url and isInvalidAvatar to false if image loads', fakeAsync(() => {
    const validUrl = 'https://example.com/avatar.png';
    const event = { target: { value: validUrl } } as unknown as Event;
    component['global_chat'].global_config = { ...component['global_chat'].global_config, bot_avatar_url: null } as GlobalChatConfigDetails;
    component['isInvalidAvatar'] = true;

    // Mock Image
    const mockImage = {
      onload: undefined as any,
      onerror: undefined as any,
      src: '',
    };
    jest.spyOn(window as any, 'Image').mockImplementation(() => mockImage);

    component['verifyAvatarURL'](event);

    // Simulate image load
    mockImage.onload();

    expect(component['global_chat'].global_config!.bot_avatar_url).toBe(validUrl);
    expect(component['isInvalidAvatar']).toBe(false);

    (window as any).Image.mockRestore();
  }));

  it('should set bot_avatar_url to null and isInvalidAvatar to true if image fails to load', fakeAsync(() => {
    const validUrl = 'https://example.com/avatar.jpg';
    const event = { target: { value: validUrl } } as unknown as Event;
    component['global_chat'].global_config = { ...component['global_chat'].global_config, bot_avatar_url: null } as GlobalChatConfigDetails;
    component['isInvalidAvatar'] = false;

    // Mock Image
    const mockImage = {
      onload: undefined as any,
      onerror: undefined as any,
      src: '',
    };
    jest.spyOn(window as any, 'Image').mockImplementation(() => mockImage);

    component['verifyAvatarURL'](event);

    // Simulate image error
    mockImage.onerror();

    expect(component['global_chat'].global_config!.bot_avatar_url).toBeNull();
    expect(component['isInvalidAvatar']).toBe(true);

    (window as any).Image.mockRestore();
  }));

  it('should not save customizing if no active guild', () => {
    component['dataService'].active_guild = null;
    component['dataService'].error_color = 'red';
    component['global_chat'].global_config = { bot_avatar_url: 'url' } as any;
    component['isInvalidAvatar'] = false;

    component['saveCustomizing']();

    // nothing should happen, no error, no alert
    expect(component['dataService'].error_color).not.toBe('green');
  });

  it('should not save customizing and show error if avatar is invalid', () => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { bot_avatar_url: null } as any;
    component['isInvalidAvatar'] = true;
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['saveCustomizing']();

    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalled();
  });

  it('should save customizing and show success alert (no lock)', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { bot_avatar_url: 'url', bot_name: 'Bot', lock_reason: null } as any;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = false;
    jest.spyOn(component['apiService'], 'saveGlobalChatCustomizing').mockReturnValue(defer(() => Promise.resolve({})));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['saveCustomizing']();
    tick();

    expect(component['dataService'].error_color).toBe('green');
    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('SUCCESS_MISC_GLOBAL_CUSTOMIZE_TITLE'),
      expect.stringContaining('SUCCESS_MISC_GLOBAL_CUSTOMIZE_DESC')
    );
    expect(component['org_global_chat']).toEqual(expect.objectContaining(component['global_chat']));
    expect(localStorage.getItem('misc_globalchat')).toBeTruthy();
  }));

  it('should save customizing and show lock/unlock success alert (with lock)', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { bot_avatar_url: 'url', bot_name: 'Bot', lock_reason: null } as any;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = false;
    jest.spyOn(component['apiService'], 'saveGlobalChatCustomizing').mockReturnValue(defer(() => Promise.resolve({})));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['saveCustomizing'](true);
    tick(5001);

    expect(component['dataService'].error_color).toBe('green');
    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('SUCCESS_MISC_GLOBAL_LOCK_TITLE'),
      expect.stringContaining('SUCCESS_MISC_GLOBAL_LOCK_DESC')
    );
    expect(component['disabledLockBtn']).toBe(false);

    // check "disabledSendBtn" branch
    component['saveCustomizing'](false);
    expect(component['disabledSendBtn']).toBe(true);

    tick(5001);
    expect(component['disabledSendBtn']).toBe(false);
  }));

  it('should show unlock alert if lock_reason was set and now unset', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { bot_avatar_url: 'url', bot_name: 'Bot', lock_reason: '/' } as any;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = false;
    jest.spyOn(component['apiService'], 'saveGlobalChatCustomizing').mockReturnValue(defer(() => Promise.resolve({})));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['saveCustomizing'](true);
    tick();

    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('SUCCESS_MISC_GLOBAL_UNLOCK_TITLE'),
      expect.stringContaining('SUCCESS_MISC_GLOBAL_LOCK_DESC')
    );
    tick(5000);
    expect(component['disabledLockBtn']).toBe(false);
  }));

  it('should handle error 404 and show missing alert', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { bot_avatar_url: 'url', bot_name: 'Bot', lock_reason: null } as any;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = false;
    jest.spyOn(component['apiService'], 'saveGlobalChatCustomizing').mockReturnValue(defer(() => Promise.reject({ status: 404 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['saveCustomizing']();
    tick(2001);

    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_MISC_GLOBAL_MISSING_TITLE'),
      expect.stringContaining('ERROR_MISC_GLOBAL_MISSING_DESC')
    );
    expect(component['disabledSendBtn']).toBe(false);

    // check "disabledLockButton" branch
    component['saveCustomizing'](true);
    tick(2001);
    expect(component['disabledLockBtn']).toBe(false);
  }));

  it('should handle error 402 and show missing alert', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { bot_avatar_url: 'url', bot_name: 'Bot', lock_reason: null } as any;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = false;
    jest.spyOn(component['apiService'], 'saveGlobalChatCustomizing').mockReturnValue(defer(() => Promise.reject({ status: 402 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['saveCustomizing']();
    tick(2001);

    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_TITLE_402'),
      expect.stringContaining('ERROR_GLOBALCHAT_402_DESC')
    );
    expect(component['disabledSendBtn']).toBe(false);

    // check "disabledLockButton" branch
    component['saveCustomizing'](true);
    tick(2001);
    expect(component['disabledLockBtn']).toBe(false);
  }));

  it('should handle error 409 and show invalid avatar alert', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { bot_avatar_url: 'url', bot_name: 'Bot', lock_reason: null } as any;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = false;
    jest.spyOn(component['apiService'], 'saveGlobalChatCustomizing').mockReturnValue(defer(() => Promise.reject({ status: 409 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['saveCustomizing']();
    tick();

    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_MISC_GLOBAL_INVALID_AVATAR_TITLE'),
      expect.stringContaining('ERROR_MISC_GLOBAL_INVALID_AVATAR_DESC')
    );
    tick(2000);
    expect(component['disabledSendBtn']).toBe(false);
  }));

  it('should handle error 429 and call redirectLoginError REQUESTS', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { bot_avatar_url: 'url', bot_name: 'Bot', lock_reason: null } as any;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = false;
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    jest.spyOn(component['apiService'], 'saveGlobalChatCustomizing').mockReturnValue(defer(() => Promise.reject({ status: 429 })));

    component['saveCustomizing']();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle error 0 and call redirectLoginError OFFLINE', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { bot_avatar_url: 'url', bot_name: 'Bot', lock_reason: null } as any;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = false;
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    jest.spyOn(component['apiService'], 'saveGlobalChatCustomizing').mockReturnValue(defer(() => Promise.reject({ status: 0 })));

    component['saveCustomizing']();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
  }));

  it('should handle unknown error and call redirectLoginError UNKNOWN', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { bot_avatar_url: 'url', bot_name: 'Bot', lock_reason: null } as any;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = false;
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    jest.spyOn(component['apiService'], 'saveGlobalChatCustomizing').mockReturnValue(defer(() => Promise.reject({ status: 500 })));

    component['saveCustomizing']();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    tick(2000);
    expect(component['disabledSendBtn']).toBe(false);
  }));

  it('should update global chat and show success alert (set)', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { channel_id: '123', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    jest.spyOn(component['apiService'], 'updateGlobalChat').mockReturnValue(defer(() => Promise.resolve({})));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    localStorage.removeItem('misc_globalchat');

    component['updateGlobalChat']();
    tick();

    expect(component['global_chat'].global_chat_pending_id).toBe('123');
    expect(component['global_chat'].global_chat_pending_delete).toBeUndefined();
    expect(component['dataService'].error_color).toBe('green');
    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('SUCCESS_MISC_GLOBAL_SET_TITLE'),
      expect.stringContaining('SUCCESS_MISC_GLOBAL_SET_DESC')
    );

    expect(component['org_global_chat']).toEqual(component['global_chat']);
    expect(localStorage.getItem('misc_globalchat')).toBeTruthy();
    expect(component['disableUpdateBtn']).toBe(false);
  }));

  it('should update global chat and show success alert (delete)', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { channel_id: '123', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    jest.spyOn(component['apiService'], 'updateGlobalChat').mockReturnValue(defer(() => Promise.resolve({})));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    localStorage.removeItem('misc_globalchat');

    component['updateGlobalChat'](true);
    tick();

    expect(component['global_chat'].global_chat_pending_id).toBe('123');
    expect(component['global_chat'].global_chat_pending_delete).toBe(true);
    expect(component['dataService'].error_color).toBe('green');
    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('SUCCESS_MISC_GLOBAL_DELETE_TITLE'),
      expect.stringContaining('SUCCESS_MISC_GLOBAL_DELETE_DESC')
    );
    expect(component['org_global_chat']).toEqual(expect.objectContaining(component['global_chat']));
    expect(localStorage.getItem('misc_globalchat')).toBeTruthy();
    expect(component['disableUpdateBtn']).toBe(false);
  }));

  it('should handle error 404 and show missing alert', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { channel_id: '123', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    jest.spyOn(component['apiService'], 'updateGlobalChat').mockReturnValue(defer(() => Promise.reject({ status: 404 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['updateGlobalChat']();
    tick();

    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_MISC_GLOBAL_MISSING_TITLE'),
      expect.stringContaining('ERROR_MISC_GLOBAL_MISSING_DESC')
    );
    expect(component['disableUpdateBtn']).toBe(false);
  }));

  it('should handle error 409 and show already set alert', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { channel_id: '123', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    jest.spyOn(component['apiService'], 'updateGlobalChat').mockReturnValue(defer(() => Promise.reject({ status: 409 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['updateGlobalChat']();
    tick();

    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_MISC_GLOBAL_ALREADY_SET_TITLE'),
      expect.stringContaining('ERROR_MISC_GLOBAL_ALREADY_SET_DESC')
    );
    expect(component['disableUpdateBtn']).toBe(false);
  }));

  it('should handle error 429 and call redirectLoginError REQUESTS', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { channel_id: '123', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    jest.spyOn(component['apiService'], 'updateGlobalChat').mockReturnValue(defer(() => Promise.reject({ status: 429 })));

    component['updateGlobalChat']();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle error 0 and call redirectLoginError OFFLINE', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { channel_id: '123', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    jest.spyOn(component['apiService'], 'updateGlobalChat').mockReturnValue(defer(() => Promise.reject({ status: 0 })));

    component['updateGlobalChat']();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
  }));

  it('should handle unknown error and call redirectLoginError UNKNOWN', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    component['global_chat'].global_config = { channel_id: '123', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    jest.spyOn(component['apiService'], 'updateGlobalChat').mockReturnValue(defer(() => Promise.reject({ status: 500 })));

    component['updateGlobalChat']();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(component['disableUpdateBtn']).toBe(false);
  }));

  it('should not update if no active guild or channel_id', () => {
    component['dataService'].active_guild = null;
    component['global_chat'].global_config = { channel_id: null } as any;
    const apiSpy = jest.spyOn(component['apiService'], 'updateGlobalChat');

    component['updateGlobalChat']();

    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should return early if no active guild', () => {
    component['dataService'].active_guild = null;
    const apiSpy = jest.spyOn(component['apiService'], 'getGuildGlobalChat');

    component['getGlobalChat']();

    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should use cached global chat if cache is valid and no_cache is false', fakeAsync(() => {
    const cachedConfig = { global_config: { channel_id: 'cached', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null }, channel_count: 1, total_message_count: 10, global_desc: 'desc' };
    localStorage.setItem('misc_globalchat', JSON.stringify(cachedConfig));
    localStorage.setItem('misc_globalchat_timestamp', Date.now().toString());
    component['dataService'].active_guild = { id: 'guild1' } as any;
    const apiSpy = jest.spyOn(component['apiService'], 'getGuildGlobalChat');
    const getChannelsSpy = jest.spyOn(component['dataService'], 'getGuildChannels');

    component['getGlobalChat']();
    tick(101);

    expect(apiSpy).not.toHaveBeenCalled();
    expect(component['global_chat']).toEqual(cachedConfig);
    expect(getChannelsSpy).toHaveBeenCalledWith(component['comService'], undefined, true, 'TEXT');
  }));

  it('should initialize global_config if missing in cache', fakeAsync(() => {
    const cachedConfig = { channel_count: 1, total_message_count: 10, global_desc: 'desc' };
    localStorage.setItem('misc_globalchat', JSON.stringify(cachedConfig));
    localStorage.setItem('misc_globalchat_timestamp', Date.now().toString());
    component['dataService'].active_guild = { id: 'guild1' } as any;

    component['getGlobalChat']();
    tick(101);

    expect(component['global_chat'].global_config).toBeDefined();
    expect(component['global_chat'].global_config!.channel_id).toBeNull();
  }));

  it('should fetch global chat from API if cache is expired or no_cache is true', fakeAsync(() => {
    localStorage.removeItem('misc_globalchat');
    localStorage.removeItem('misc_globalchat_timestamp');
    component['dataService'].active_guild = { id: 'guild1' } as any;
    const apiConfig = { global_config: { channel_id: 'api', message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null }, channel_count: 2, total_message_count: 20, global_desc: 'desc', global_chat_pending_id: 'api' };
    jest.spyOn(component['apiService'], 'getGuildGlobalChat').mockReturnValue(defer(() => Promise.resolve(apiConfig)));
    const getChannelsSpy = jest.spyOn(component['dataService'], 'getGuildChannels');

    component['getGlobalChat'](true);
    tick(551);

    expect(component['global_chat']).toEqual(apiConfig);
    expect(component['global_chat'].global_config!.channel_id).toBe('api');
    expect(getChannelsSpy).toHaveBeenCalledWith(component['comService'], true, true, 'TEXT');
    expect(localStorage.getItem('misc_globalchat')).toBeTruthy();
    expect(localStorage.getItem('misc_globalchat_timestamp')).toBeTruthy();
  }));

  it('should initialize global_config if missing in API response', fakeAsync(() => {
    localStorage.removeItem('misc_globalchat');
    localStorage.removeItem('misc_globalchat_timestamp');
    component['dataService'].active_guild = { id: 'guild1' } as any;
    const apiConfig = { channel_count: 2, total_message_count: 20, global_desc: 'desc' } as GlobalChatConfig;
    jest.spyOn(component['apiService'], 'getGuildGlobalChat').mockReturnValue(defer(() => Promise.resolve(apiConfig)));

    component['getGlobalChat']();
    tick();

    expect(component['global_chat'].global_config).toBeDefined();
    expect(component['global_chat'].global_config!.channel_id).toBeNull();
  }));

  it('should set channel_id from global_chat_pending_id if present in API response', fakeAsync(() => {
    localStorage.removeItem('misc_globalchat');
    localStorage.removeItem('misc_globalchat_timestamp');
    component['dataService'].active_guild = { id: 'guild1' } as any;
    const apiConfig = { global_config: { channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null }, global_chat_pending_id: 'pending', channel_count: 2, total_message_count: 20, global_desc: 'desc' };
    jest.spyOn(component['apiService'], 'getGuildGlobalChat').mockReturnValue(defer(() => Promise.resolve(apiConfig)));

    component['getGlobalChat']();
    tick();

    expect(component['global_chat'].global_config!.channel_id).toBe('pending');
  }));

  it('should handle error 429 and call redirectLoginError REQUESTS', fakeAsync(() => {
    localStorage.removeItem('misc_globalchat');
    localStorage.removeItem('misc_globalchat_timestamp');
    component['dataService'].active_guild = { id: 'guild1' } as any;
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    jest.spyOn(component['apiService'], 'getGuildGlobalChat').mockReturnValue(defer(() => Promise.reject({ status: 429 })));

    component['getGlobalChat']();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle error 0 and call redirectLoginError OFFLINE', fakeAsync(() => {
    localStorage.removeItem('misc_globalchat');
    localStorage.removeItem('misc_globalchat_timestamp');
    component['dataService'].active_guild = { id: 'guild1' } as any;
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    jest.spyOn(component['apiService'], 'getGuildGlobalChat').mockReturnValue(defer(() => Promise.reject({ status: 0 })));

    component['getGlobalChat']();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
  }));

  it('should handle unknown error and call redirectLoginError UNKNOWN', fakeAsync(() => {
    localStorage.removeItem('misc_globalchat');
    localStorage.removeItem('misc_globalchat_timestamp');
    component['dataService'].active_guild = { id: 'guild1' } as any;
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    jest.spyOn(component['apiService'], 'getGuildGlobalChat').mockReturnValue(defer(() => Promise.reject({ status: 500 })));

    component['getGlobalChat']();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  }));

  it('should return true if bot_name is set but only whitespace', () => {
    component['global_chat'].global_config = { ...component['global_chat'].global_config, bot_name: '   ' } as GlobalChatConfigDetails;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = false;
    expect(component['isInvalidInput']()).toBe(true);
  });

  it('should return true if global_desc is set but only whitespace', () => {
    component['global_chat'].global_config = { ...component['global_chat'].global_config, bot_name: 'Bot' } as GlobalChatConfigDetails;
    component['global_chat'].global_desc = '   ';
    component['isInvalidAvatar'] = false;
    expect(component['isInvalidInput']()).toBe(true);
  });

  it('should return true if isInvalidAvatar is true', () => {
    component['global_chat'].global_config = { ...component['global_chat'].global_config, bot_name: 'Bot' } as GlobalChatConfigDetails;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = true;
    expect(component['isInvalidInput']()).toBe(true);
  });

  it('should return false if bot_name and global_desc are valid and isInvalidAvatar is false', () => {
    component['global_chat'].global_config = { ...component['global_chat'].global_config, bot_name: 'Bot' } as GlobalChatConfigDetails;
    component['global_chat'].global_desc = 'desc';
    component['isInvalidAvatar'] = false;
    expect(component['isInvalidInput']()).toBe(false);
  });

  it('should return false if bot_name and global_desc are null and isInvalidAvatar is false', () => {
    component['global_chat'].global_config = { ...component['global_chat'].global_config, bot_name: null } as GlobalChatConfigDetails;
    component['global_chat'].global_desc = null;
    component['isInvalidAvatar'] = false;
    expect(component['isInvalidInput']()).toBe(false);
  });
});
