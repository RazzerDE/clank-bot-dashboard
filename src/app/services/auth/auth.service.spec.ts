import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import { AuthService } from './auth.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {DataHolderService} from "../data/data-holder.service";
import { HttpClient } from "@angular/common/http";
import {defer, of, throwError} from "rxjs";
import {config} from "../../../environments/config";

describe('AuthService', () => {
  let service: AuthService;
  let dataService: DataHolderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), HttpClientTestingModule],
    providers: [{ provide: ActivatedRoute, useValue: { snapshot: {}, queryParams: of({}) } },
        { provide: Router, useValue: { navigateByUrl: jest.fn().mockResolvedValue(true) } }]});

    localStorage.setItem('access_token', 'test');
    service = TestBed.inject(AuthService);
    dataService = TestBed.inject(DataHolderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    localStorage.removeItem('access_token');
  });

  it('should append state and redirect to the auth URL on successful state save', () => {
    jest.spyOn(service as any, 'generateSecureState').mockReturnValue('testState');
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(of(void 0));
    const windowSpy = jest.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    });

    (service as any).appendState();

    expect(postSpy).toHaveBeenCalled();
    expect(windowSpy).toHaveBeenCalled();
    postSpy.mockRestore();
    windowSpy.mockRestore();
  });

  it('should append state and redirect to the auth URL on successful state save (replace state because it exists)', () => {
    jest.spyOn(service as any, 'generateSecureState').mockReturnValue('testState');
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(of(void 0));
    const windowSpy = jest.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    });
    service['authUrl'] = service['authUrl'] + '&state=oldState';

    (service as any).appendState();

    expect(postSpy).toHaveBeenCalled();
    expect(windowSpy).toHaveBeenCalled();
    postSpy.mockRestore();
    windowSpy.mockRestore();
  });

  it('should call redirectLoginError with UNKNOWN if state save fails', () => {
    jest.spyOn(service as any, 'generateSecureState').mockReturnValue('testState');
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(throwError(() => new Error('Error')));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    (service as any).appendState();

    expect(postSpy).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  });

  it('should check if user has admin permissions', () => {
    const permString = '8'; // Binary: 1000, which includes the admin permission bit
    const nonAdminPermString = '4'; // Binary: 0100, which does not include the admin permission bit

    expect(service.isAdmin(permString)).toBe(true);
    expect(service.isAdmin(nonAdminPermString)).toBe(false);
  });

  it('should redirect to EXPIRED if state_expiry is missing', fakeAsync(() => {
    localStorage.removeItem('state_expiry');
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    service.authenticateUser('code', 'state');

    expect(redirectSpy).toHaveBeenCalledWith('EXPIRED');
  }));

  it('should redirect to EXPIRED if state_expiry is expired', fakeAsync(() => {
    localStorage.setItem('state_expiry', (Date.now() - 1000).toString());
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    service.authenticateUser('code', 'state');

    expect(redirectSpy).toHaveBeenCalledWith('EXPIRED');
  }));

  it('should redirect to INVALID if state does not match', fakeAsync(() => {
    localStorage.setItem('state_expiry', (Date.now() + 10000).toString());
    localStorage.setItem('state', btoa('otherState'));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    service.authenticateUser('code', 'state');

    expect(redirectSpy).toHaveBeenCalledWith('INVALID');
  }));

  it('should authenticate and fetch profile if fetch_profile is true', fakeAsync(() => {
    localStorage.setItem('state_expiry', (Date.now() + 10000).toString());
    localStorage.setItem('state', btoa('testState'));
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(defer(() => Promise.resolve({})));
    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigateByUrl').mockReturnValue(Promise.resolve(true));
    const getProfileSpy = jest.spyOn(service as any, 'getProfileInfo');

    service.authenticateUser('code', 'testState', true);
    tick();

    expect(postSpy).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith('/dashboard');
    expect(getProfileSpy).toHaveBeenCalled();
  }));

  it('should authenticate and set isLoginLoading to false if fetch_profile is false', fakeAsync(() => {
    localStorage.setItem('state_expiry', (Date.now() + 10000).toString());
    localStorage.setItem('state', btoa('testState'));
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(defer(() => Promise.resolve({})));
    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigateByUrl').mockReturnValue(Promise.resolve(true));

    service.authenticateUser('code', 'testState', false);
    tick();

    expect(postSpy).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith('/dashboard');
    expect(dataService.isLoginLoading).toBe(false);
  }));

  it('should redirect to INVALID on 400 error', fakeAsync(() => {
    localStorage.setItem('state_expiry', (Date.now() + 10000).toString());
    localStorage.setItem('state', btoa('testState'));
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(defer(() => Promise.reject({ status: 400 })));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    service.authenticateUser('code', 'testState');
    tick();

    expect(postSpy).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledWith('INVALID');
  }));

  it('should redirect to BLOCKED on 429 error', fakeAsync(() => {
    localStorage.setItem('state_expiry', (Date.now() + 10000).toString());
    localStorage.setItem('state', btoa('testState'));
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(defer(() => Promise.reject({ status: 429 })));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    service.authenticateUser('code', 'testState');
    tick();

    expect(postSpy).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledWith('BLOCKED');
  }));

  it('should redirect to UNKNOWN on other errors', fakeAsync(() => {
    localStorage.setItem('state_expiry', (Date.now() + 10000).toString());
    localStorage.setItem('state', btoa('testState'));
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(defer(() => Promise.reject({ status: 500 })));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    service.authenticateUser('code', 'testState');
    tick();

    expect(postSpy).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  }));

  it('should set profile, set isLoginLoading to false, call getGuilds and allowDataFetch on success', fakeAsync(() => {
    const mockUser = { id: '123', username: 'test' } as any;
    const getSpy = jest.spyOn(TestBed.inject(HttpClient), 'get').mockReturnValue(defer(() => Promise.resolve(mockUser)));
    const getGuildsSpy = jest.spyOn(dataService, 'getGuilds');
    const allowDataFetchSpy = jest.spyOn(dataService.allowDataFetch, 'next');

    (service as any).getProfileInfo();
    tick(500);

    expect(getSpy).toHaveBeenCalled();
    expect(dataService.profile).toEqual(mockUser);
    expect(dataService.isLoginLoading).toBe(false);
    expect(getGuildsSpy).toHaveBeenCalledWith(service['comService'], service);
    expect(allowDataFetchSpy).toHaveBeenCalledWith(true);
  }));

  it('should logout and redirect to EXPIRED on 401 error', fakeAsync(() => {
    const getSpy = jest.spyOn(TestBed.inject(HttpClient), 'get').mockReturnValue(defer(() => Promise.reject({ status: 401 })));
    const logoutSpy = jest.spyOn(service, 'logout');
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    (service as any).getProfileInfo();
    tick();

    expect(getSpy).toHaveBeenCalled();
    expect(logoutSpy).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledWith('EXPIRED');
  }));

  it('should logout and redirect to REQUESTS on 429 error', fakeAsync(() => {
    const getSpy = jest.spyOn(TestBed.inject(HttpClient), 'get').mockReturnValue(defer(() => Promise.reject({ status: 429 })));
    const logoutSpy = jest.spyOn(service, 'logout');
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    (service as any).getProfileInfo();
    tick();

    expect(getSpy).toHaveBeenCalled();
    expect(logoutSpy).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should logout and redirect to UNKNOWN on other errors', fakeAsync(() => {
    const getSpy = jest.spyOn(TestBed.inject(HttpClient), 'get').mockReturnValue(defer(() => Promise.reject({ status: 500 })));
    const logoutSpy = jest.spyOn(service, 'logout');
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    (service as any).getProfileInfo();
    tick();

    expect(getSpy).toHaveBeenCalled();
    expect(logoutSpy).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  }));

  it('should generate a secure random state string of 64 hex characters', () => {
    const state = (service as any).generateSecureState();

    expect(typeof state).toBe('string');
    expect(state).toMatch(/^[a-f0-9]{64}$/);
    expect(state.length).toBe(64);
  });

  it('should generate different state strings on each call', () => {
    const state1 = (service as any).generateSecureState();
    const state2 = (service as any).generateSecureState();

    expect(state1).not.toBe(state2);
  });

  it('should clear localStorage and navigate to home on successful logout', fakeAsync(() => {
    localStorage.setItem('access_token', 'test');
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(defer(() => Promise.resolve({})));
    const navSpy = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockReturnValue(Promise.resolve(true));

    service.logout();
    tick();

    expect(postSpy).toHaveBeenCalledWith(`${config.api_url}/auth/logout`, {}, { withCredentials: true });
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(navSpy).toHaveBeenCalledWith('/');
  }));

  it('should call redirectLoginError with INVALID on 400 error', fakeAsync(() => {
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(defer(() => Promise.reject({ status: 400 })));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    service.logout();
    tick();

    expect(postSpy).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledWith('INVALID');
  }));

  it('should call redirectLoginError with BLOCKED on 429 error', fakeAsync(() => {
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(defer(() => Promise.reject({ status: 429 })));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    service.logout();
    tick();

    expect(postSpy).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledWith('BLOCKED');
  }));

  it('should call redirectLoginError with UNKNOWN on other errors', fakeAsync(() => {
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(defer(() => Promise.reject({ status: 500 })));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    service.logout();
    tick();

    expect(postSpy).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  }));

  it('should call appendState if code or state is missing and not on error page', () => {
    const service = TestBed.inject(AuthService);
    const appendStateSpy = jest.spyOn(service as any, 'appendState');
    const params = { code: undefined, state: undefined };
    Object.defineProperty(window, 'location', {value: { pathname: '/' }, writable: true});

    (service as any).route = { queryParams: of(params) };
    service.discordLogin();

    expect(appendStateSpy).toHaveBeenCalled();
  });

  it('should not call appendState if on error page', () => {
    const service = TestBed.inject(AuthService);
    const appendStateSpy = jest.spyOn(service as any, 'appendState');
    const params = { code: undefined, state: undefined };
    Object.defineProperty(window, 'location', {value: { pathname: '/errors/invalid' }, writable: true});

    (service as any).route = { queryParams: of(params) };
    service.discordLogin();

    expect(appendStateSpy).not.toHaveBeenCalled();
  });

  it('should call authenticateUser if code and state are present', () => {
    const service = TestBed.inject(AuthService);
    const authenticateUserSpy = jest.spyOn(service, 'authenticateUser');
    const params = { code: 'testCode', state: 'testState' };

    (service as any).route = { queryParams: of(params) };
    service.discordLogin();

    expect(authenticateUserSpy).toHaveBeenCalledWith('testCode', 'testState');
  });

});
