import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { AutomodUnbanComponent } from './automod-unban.component';
import {TranslateModule} from "@ngx-translate/core";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import { defer } from 'rxjs';
import {Guild} from "../../../../services/types/discord/Guilds";
import {UnbanMethod} from "../../../../services/types/Security";

describe('AutomodUnbanComponent', () => {
  let component: AutomodUnbanComponent;
  let fixture: ComponentFixture<AutomodUnbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomodUnbanComponent, TranslateModule.forRoot(), NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomodUnbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    jest.spyOn(component as any, 'getUnbanMethod').mockImplementation();

    component['dataService'].allowDataFetch.next(true);
    expect(component['getUnbanMethod']).toHaveBeenCalled();
  });

  it('should use cache from localStorage if valid and not no_cache', fakeAsync(() => {
    const mockConfig = { method_extra: 'foo', method_type: 'BAR' };
    localStorage.setItem('unban_method', JSON.stringify(mockConfig));
    localStorage.setItem('unban_method_timestamp', Date.now().toString());
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    component['unban_method'] = { method_extra: null, method_type: null };
    component['org_features'] = { method_extra: null, method_type: null };

    component['getUnbanMethod']();

    expect(component['unban_method']).toEqual(mockConfig);
    expect(component['org_features']).toEqual(mockConfig);
    expect(component['dataService'].isLoading).toBe(false);
  }));

  it('should fetch from API if no cache or cache expired', fakeAsync(() => {
    localStorage.removeItem('unban_method');
    localStorage.removeItem('unban_method_timestamp');
    const mockConfig = { method_extra: 'foo', method_type: 'BAR' } as unknown as UnbanMethod;
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const apiSpy = jest.spyOn(component['apiService'], 'getUnbanMethod').mockReturnValue(defer(() => Promise.resolve(mockConfig)));
    component['dataService'].isLoading = false;

    component['getUnbanMethod']();
    tick();

    expect(apiSpy).toHaveBeenCalledWith('guild1');
    expect(component['unban_method']).toEqual(mockConfig);
    expect(component['org_features']).toEqual(mockConfig);
    expect(component['dataService'].isLoading).toBe(false);
    expect(localStorage.getItem('unban_method')).toEqual(JSON.stringify(mockConfig));
    expect(localStorage.getItem('unban_method_timestamp')).not.toBeNull();
  }));

  it('should fetch from API if no_cache is true', fakeAsync(() => {
    const mockConfig = {method_extra: 'test', method_type: 'EMAIL'} as unknown as UnbanMethod;
    localStorage.setItem('unban_method', JSON.stringify({ method_extra: 'old', method_type: 'OLD' }));
    localStorage.setItem('unban_method_timestamp', Date.now().toString());
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const apiSpy = jest.spyOn(component['apiService'], 'getUnbanMethod').mockReturnValue(defer(() => Promise.resolve(mockConfig)));

    component['getUnbanMethod'](true);
    tick();

    expect(apiSpy).toHaveBeenCalledWith('guild1');
    expect(component['unban_method']).toEqual(mockConfig);
    expect(component['org_features']).toEqual(mockConfig);
  }));

  it('should handle API error 429 and call redirectLoginError with REQUESTS', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(component['apiService'], 'getUnbanMethod').mockReturnValue(
      defer(() => Promise.reject({ status: 429 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['getUnbanMethod'](true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(component['dataService'].isLoading).toBe(false);
  }));

  it('should handle API error 0 and call redirectLoginError with OFFLINE', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(component['apiService'], 'getUnbanMethod').mockReturnValue(
      defer(() => Promise.reject({ status: 0 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['getUnbanMethod'](true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
    expect(component['dataService'].isLoading).toBe(false);
  }));

  it('should handle unknown API error and call redirectLoginError with UNKNOWN', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(component['apiService'], 'getUnbanMethod').mockReturnValue(
      defer(() => Promise.reject({ status: 500 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['getUnbanMethod'](true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(component['dataService'].isLoading).toBe(false);
  }));

  it('should do nothing if active_guild is not set', () => {
    component['dataService'].active_guild = null;
    const apiSpy = jest.spyOn(component['apiService'], 'getUnbanMethod');
    component['getUnbanMethod']();
    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should do nothing if no active_guild is set', () => {
    component['dataService'].active_guild = null;
    const apiSpy = jest.spyOn(component['apiService'], 'doUnbanAction');
    component['doAction'](0, document.createElement('button'));
    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should call isInvalidUnbanMethodInput and return if invalid for action 0 and method_type not BOT', () => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    component['unban_method'] = { method_type: 'EMAIL', method_extra: null };
    const btn = document.createElement('button');
    const invalidSpy = jest.spyOn(component as any, 'isInvalidUnbanMethodInput').mockReturnValue(true);
    const apiSpy = jest.spyOn(component['apiService'], 'doUnbanAction');
    component['doAction'](0, btn);
    expect(invalidSpy).toHaveBeenCalled();
    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should call apiService.doUnbanAction and handle success for action 1 (delete)', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    component['unban_method'] = { method_type: null, method_extra: 'test@example.com' };
    const btn = document.createElement('button');
    jest.spyOn(component['apiService'], 'doUnbanAction').mockReturnValue(defer(() => Promise.resolve({})));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    component['org_features'] = { method_type: 'EMAIL', method_extra: 'test@example.com' };

    component['doAction'](1, btn);
    tick();

    expect(component['unban_method']).toEqual({ method_type: null, method_extra: null });
    expect(component['org_features']).toEqual({ method_type: null, method_extra: null });
    expect(showAlertSpy).toHaveBeenCalled();
    expect(btn.disabled).toBe(true);
  }));

  it('should call apiService.doUnbanAction and handle success for action 0 (save)', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    component['unban_method'] = { method_type: 'BOT', method_extra: 'foo' };
    const btn = document.createElement('button');
    jest.spyOn(component['apiService'], 'doUnbanAction').mockReturnValue(defer(() => Promise.resolve({})));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    component['org_features'] = { method_type: 'BOT', method_extra: 'foo' };

    component['doAction'](0, btn);
    tick();

    expect(component['unban_method'].method_extra).toBeNull();
    expect(component['org_features'].method_extra).toBeNull();
    expect(showAlertSpy).toHaveBeenCalled();
    expect(btn.disabled).toBe(true);
  }));

  it('should handle error 409 and call isInvalidUnbanMethodInput', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    component['unban_method'] = { method_type: 'EMAIL', method_extra: 'test@example.com' };
    const btn = document.createElement('button');
    jest.spyOn(component['apiService'], 'doUnbanAction').mockReturnValue(defer(() => Promise.reject({ status: 409 })));
    const invalidSpy = jest.spyOn(component as any, 'isInvalidUnbanMethodInput').mockReturnValueOnce(false).mockReturnValueOnce(true);

    component['doAction'](0, btn);
    tick();

    expect(invalidSpy).toHaveBeenCalled();
    expect(btn.disabled).toBe(true);
  }));

  it('should handle error 429 and call redirectLoginError with REQUESTS', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    component['unban_method'] = { method_type: 'EMAIL', method_extra: 'test@example.com' };
    const btn = document.createElement('button');
    jest.spyOn(component['apiService'], 'doUnbanAction').mockReturnValue(defer(() => Promise.reject({ status: 429 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['doAction'](0, btn);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(btn.disabled).toBe(true);
  }));

  it('should handle error 0 and call redirectLoginError with OFFLINE', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    component['unban_method'] = { method_type: 'EMAIL', method_extra: 'test@example.com' };
    const btn = document.createElement('button');
    jest.spyOn(component['apiService'], 'doUnbanAction').mockReturnValue(defer(() => Promise.reject({ status: 0 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['doAction'](0, btn);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
    expect(btn.disabled).toBe(true);
  }));

  it('should handle unknown error and call redirectLoginError with UNKNOWN', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    component['unban_method'] = { method_type: 'EMAIL', method_extra: 'test@example.com' };
    const btn = document.createElement('button');
    jest.spyOn(component['apiService'], 'doUnbanAction').mockReturnValue(defer(() => Promise.reject({ status: 500 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();

    component['doAction'](0, btn);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(btn.disabled).toBe(true);
  }));

  it('should call insertBotAction with action 2, show success alert, and re-enable button after 30s on success', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const btn = document.createElement('button');
    const apiSpy = jest.spyOn(component['apiService'], 'insertBotAction').mockReturnValue(defer(() => Promise.resolve({})));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation();

    component['startAutoModSetup'](0, btn);
    tick();

    expect(apiSpy).toHaveBeenCalledWith('guild1', 2);
    expect(showAlertSpy).toHaveBeenCalledWith(
      component['translate'].instant('SUCCESS_SECURITY_AUTOMOD_TITLE'),
      component['translate'].instant('SUCCESS_SECURITY_AUTOMOD_DESC')
    );
    expect(modalSpy).toHaveBeenCalled();
    expect(btn.disabled).toBe(true);
  }));

  it('should show error alert and re-enable button after 5s on error 409', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const btn = document.createElement('button');
    jest.spyOn(component['apiService'], 'insertBotAction').mockReturnValue(defer(() => Promise.reject({ status: 409 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation();

    component['startAutoModSetup'](2, btn);
    tick();

    expect(showAlertSpy).toHaveBeenCalledWith(
      component['translate'].instant('ERROR_SECURITY_AUTOMOD_TITLE'),
      component['translate'].instant('ERROR_SECURITY_AUTOMOD_DESC')
    );
    expect(modalSpy).toHaveBeenCalled();
    expect(btn.disabled).toBe(true);
  }));

  it('should call redirectLoginError with REQUESTS and re-enable button after 5s on error 429', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const btn = document.createElement('button');
    jest.spyOn(component['apiService'], 'insertBotAction').mockReturnValue(defer(() => Promise.reject({ status: 429 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation();

    component['startAutoModSetup'](2, btn);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(modalSpy).toHaveBeenCalled();
    expect(btn.disabled).toBe(true);
  }));

  it('should call redirectLoginError with OFFLINE and re-enable button after 5s on error 0', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const btn = document.createElement('button');
    jest.spyOn(component['apiService'], 'insertBotAction').mockReturnValue(defer(() => Promise.reject({ status: 0 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation();

    component['startAutoModSetup'](2, btn);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
    expect(modalSpy).toHaveBeenCalled();
    expect(btn.disabled).toBe(true);
  }));

  it('should call redirectLoginError with UNKNOWN and re-enable button after 5s on unknown error', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const btn = document.createElement('button');
    jest.spyOn(component['apiService'], 'insertBotAction').mockReturnValue(defer(() => Promise.reject({ status: 500 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation();
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation();

    component['startAutoModSetup'](2, btn);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(modalSpy).toHaveBeenCalled();
    expect(btn.disabled).toBe(true);
  }));

  it('should do nothing if active_guild is not set', () => {
    component['dataService'].active_guild = null;
    const btn = document.createElement('button');
    const apiSpy = jest.spyOn(component['apiService'], 'insertBotAction');
    const modalSpy = jest.spyOn(component['modal'], 'hideModal');
    component['startAutoModSetup'](2, btn);
    expect(apiSpy).not.toHaveBeenCalled();
    expect(modalSpy).not.toHaveBeenCalled();
  });

  it('should disable the cache button, set loading, call getUnbanMethod with no_cache=true, and re-enable the button after 15s', fakeAsync(() => {
    component['disabledCacheBtn'] = false;
    component['dataService'].isLoading = false;
    const getUnbanMethodSpy = jest.spyOn(component as any, 'getUnbanMethod');

    component['refreshCache']();

    expect(component['disabledCacheBtn']).toBe(true);
    expect(component['dataService'].isLoading).toBe(true);
    expect(getUnbanMethodSpy).toHaveBeenCalledWith(true);

    tick(15000);
    expect(component['disabledCacheBtn']).toBe(false);
  }));

  it('should set unban_method.method_type to null and return if method_type is empty string', () => {
    component['unban_method'] = { method_type: 'EMAIL', method_extra: 'foo' };
    component['org_features'] = { method_type: 'EMAIL', method_extra: 'foo' };

    component['setUnbanMethodType']('');

    expect(component['unban_method'].method_type).toBeNull();
  });

  it('should set unban_method.method_type and reset method_extra to null if type changed to FORM', () => {
    component['unban_method'] = { method_type: 'EMAIL', method_extra: 'foo' };
    component['org_features'] = { method_type: 'EMAIL', method_extra: 'foo' };

    component['setUnbanMethodType']('FORM');

    expect(component['unban_method'].method_type).toBe('FORM');
    expect(component['unban_method'].method_extra).toBeNull();
  });

  it('should set unban_method.method_type and reset method_extra to null if type changed to EMAIL', () => {
    component['unban_method'] = { method_type: 'FORM', method_extra: 'bar' };
    component['org_features'] = { method_type: 'FORM', method_extra: 'bar' };

    component['setUnbanMethodType']('EMAIL');

    expect(component['unban_method'].method_type).toBe('EMAIL');
    expect(component['unban_method'].method_extra).toBeNull();
  });

  it('should set unban_method.method_type and reset method_extra to null if type changed to INVITE', () => {
    component['unban_method'] = { method_type: 'FORM', method_extra: 'baz' };
    component['org_features'] = { method_type: 'FORM', method_extra: 'baz' };

    component['setUnbanMethodType']('INVITE');

    expect(component['unban_method'].method_type).toBe('INVITE');
    expect(component['unban_method'].method_extra).toBeNull();
  });

  it('should set unban_method.method_type and reset method_extra to org_features.method_extra if type did not change or is BOT', () => {
    component['unban_method'] = { method_type: 'BOT', method_extra: 'abc' };
    component['org_features'] = { method_type: 'BOT', method_extra: 'original' };

    component['setUnbanMethodType']('BOT');

    expect(component['unban_method'].method_type).toBe('BOT');
    expect(component['unban_method'].method_extra).toBe('original');
  });

  it('should set unban_method.method_type and reset method_extra to org_features.method_extra if type did not change and is not FORM/EMAIL/INVITE', () => {
    component['unban_method'] = { method_type: 'BOT', method_extra: 'abc' };
    component['org_features'] = { method_type: 'BOT', method_extra: 'original' };

    component['setUnbanMethodType']('BOT');

    expect(component['unban_method'].method_type).toBe('BOT');
    expect(component['unban_method'].method_extra).toBe('original');
  });

  it('should return true if org_features and unban_method differ', () => {
    component['org_features'] = { method_type: 'EMAIL', method_extra: 'foo' };
    component['unban_method'] = { method_type: 'FORM', method_extra: 'bar' };
    expect(component['hasMethodChanges']()).toBe(true);
  });

  it('should return false if org_features and unban_method are equal', () => {
    component['org_features'] = { method_type: 'EMAIL', method_extra: 'foo' };
    component['unban_method'] = { method_type: 'EMAIL', method_extra: 'foo' };
    expect(component['hasMethodChanges']()).toBe(false);
  });

  it('should return true and disable save button if method_type is FORM and method_extra is null', () => {
    component['unban_method'] = { method_type: 'FORM', method_extra: null };
    component['disabledSaveBtn'] = false;
    expect(component['isInvalidMethodExtra']()).toBe(true);
    expect(component['disabledSaveBtn']).toBe(true);
  });

  it('should return true and disable save button if method_type is EMAIL and method_extra is empty string', () => {
    component['unban_method'] = { method_type: 'EMAIL', method_extra: '' };
    component['disabledSaveBtn'] = false;
    expect(component['isInvalidMethodExtra']()).toBe(true);
    expect(component['disabledSaveBtn']).toBe(true);
  });

  it('should return true and disable save button if method_type is INVITE and method_extra is whitespace', () => {
    component['unban_method'] = { method_type: 'INVITE', method_extra: '   ' };
    component['disabledSaveBtn'] = false;
    expect(component['isInvalidMethodExtra']()).toBe(true);
    expect(component['disabledSaveBtn']).toBe(true);
  });

  it('should return false and not disable save button if method_type is FORM and method_extra is not empty', () => {
    component['unban_method'] = { method_type: 'FORM', method_extra: 'https://example.com' };
    component['disabledSaveBtn'] = false;
    expect(component['isInvalidMethodExtra']()).toBe(false);
    expect(component['disabledSaveBtn']).toBe(false);
  });

  it('should return false and not disable save button if method_type is BOT', () => {
    component['unban_method'] = { method_type: 'BOT', method_extra: null };
    component['disabledSaveBtn'] = false;
    expect(component['isInvalidMethodExtra']()).toBe(false);
    expect(component['disabledSaveBtn']).toBe(false);
  });

  it('should return true and show alert if method_extra is null', () => {
    component['unban_method'] = { method_type: 'EMAIL', method_extra: null };
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const result = (component as any).isInvalidUnbanMethodInput();
    expect(showAlertSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return true and show alert if method_extra is empty string', () => {
    component['unban_method'] = { method_type: 'EMAIL', method_extra: '' };
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const result = (component as any).isInvalidUnbanMethodInput();
    expect(showAlertSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return true and show alert if method_type is INVITE and method_extra does not start with https://discord.gg/', () => {
    component['unban_method'] = { method_type: 'INVITE', method_extra: 'invalidInvite' };
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const result = (component as any).isInvalidUnbanMethodInput();
    expect(showAlertSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return true and show alert if method_type is EMAIL and method_extra is not a valid email', () => {
    component['unban_method'] = { method_type: 'EMAIL', method_extra: 'invalidEmail' };
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const result = (component as any).isInvalidUnbanMethodInput();
    expect(showAlertSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return true and show alert if method_type is FORM and method_extra is not a valid URL', () => {
    component['unban_method'] = { method_type: 'FORM', method_extra: 'notAUrl' };
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const result = (component as any).isInvalidUnbanMethodInput();
    expect(showAlertSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return false if method_type is EMAIL and method_extra is a valid email', () => {
    component['unban_method'] = { method_type: 'EMAIL', method_extra: 'test@example.com' };
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const result = (component as any).isInvalidUnbanMethodInput();
    expect(showAlertSpy).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should return false if method_type is INVITE and method_extra starts with https://discord.gg/', () => {
    component['unban_method'] = { method_type: 'INVITE', method_extra: 'https://discord.gg/abc123' };
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const result = (component as any).isInvalidUnbanMethodInput();
    expect(showAlertSpy).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should return false if method_type is FORM and method_extra is a valid URL', () => {
    component['unban_method'] = { method_type: 'FORM', method_extra: 'https://example.com/form' };
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const result = (component as any).isInvalidUnbanMethodInput();
    expect(showAlertSpy).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should return false if method_type is BOT and method_extra is any value', () => {
    component['unban_method'] = { method_type: 'BOT', method_extra: 'anything' };
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const result = (component as any).isInvalidUnbanMethodInput();
    expect(showAlertSpy).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should return false if method_type is null and method_extra is not null', () => {
    component['unban_method'] = { method_type: null, method_extra: 'something' };
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation();
    const result = (component as any).isInvalidUnbanMethodInput();
    expect(showAlertSpy).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
