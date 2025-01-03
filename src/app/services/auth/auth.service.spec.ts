import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {DataHolderService} from "../data/data-holder.service";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {of, throwError} from "rxjs";
import {DiscordUser} from "../types/discord/User";

describe('AuthService', () => {
  let service: AuthService;
  let dataService: DataHolderService;
  let httpClientSpy: jest.SpyInstance;
  let route: ActivatedRoute;
  let jwtHelperSpy: jest.SpyInstance;
  let routerSpy: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: {}, queryParams: of({}) }},
        { provide: Router, useValue: { navigateByUrl: jest.fn().mockResolvedValue(true) } }]
    });

    localStorage.setItem('access_token', 'test');
    service = TestBed.inject(AuthService);
    dataService = TestBed.inject(DataHolderService);
    route = TestBed.inject(ActivatedRoute);
    jwtHelperSpy = jest.spyOn(service['jwtHelper'], 'decodeToken');
    httpClientSpy = jest.spyOn(TestBed.inject(HttpClient), 'get') as jest.SpyInstance;
    routerSpy = jest.spyOn(TestBed.inject(Router), 'navigateByUrl');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    localStorage.removeItem('access_token');
  });

  it('should redirect to EXPIRED error page if state is expired', () => {
    const stateExpiry = Date.now() - 10000; // Set expiry to 10 seconds in the past
    localStorage.setItem('state_expiry', stateExpiry.toString());
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    (service as any).authenticateUser('testCode', 'testState');

    expect(redirectSpy).toHaveBeenCalledWith('EXPIRED');
  });

  it('should authenticate user and store access token on successful response', () => {
    const mockResponse = { access_token: 'encryptedToken' };
    const decryptedToken = 'decryptedToken';
    jest.spyOn(service as any, 'decryptToken').mockReturnValue(decryptedToken);
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(of(mockResponse));
    const navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigateByUrl');

    localStorage.setItem('state', btoa('testState'));
    localStorage.setItem('state_expiry', (Date.now() + 10000).toString());

    (service as any).authenticateUser('testCode', 'testState', true);

    expect(postSpy).toHaveBeenCalled();
    expect(localStorage.getItem('access_token')).toBe(decryptedToken);
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle 400 error response and redirect to INVALID error page', () => {
    const mockErrorResponse = new HttpErrorResponse({ status: 400 });
    jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(throwError(() => mockErrorResponse));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    localStorage.setItem('state_expiry', (Date.now() + 10000).toString());
    localStorage.setItem('state', btoa('testState'));

    (service as any).authenticateUser('testCode', 'testState');

    expect(redirectSpy).toHaveBeenCalledWith('INVALID');
  });

  it('should handle 429 error response and redirect to BLOCKED error page', () => {
    const mockErrorResponse = new HttpErrorResponse({ status: 429 });
    jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(throwError(() => mockErrorResponse));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    (service as any).authenticateUser('testCode', 'testState');

    expect(redirectSpy).toHaveBeenCalledWith('BLOCKED');
  });

  it('should handle unknown error response and redirect to UNKNOWN error page', () => {
    const mockErrorResponse = new HttpErrorResponse({ status: 500 });
    jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(throwError(() => mockErrorResponse));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    (service as any).authenticateUser('testCode', 'testState');

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  });

  it('should return if response.access_token is not present', () => {
    const mockResponse = { access_token: null };
    jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(of(mockResponse));
    jest.spyOn(service as any, 'decryptToken').mockReturnValue('');
    jest.spyOn(service as any, 'setAuthorizationHeader');

    localStorage.setItem('state', btoa('testState'));
    localStorage.setItem('state_expiry', (Date.now() + 10000).toString());

    (service as any).authenticateUser('testCode', 'testState');
    expect(service['setAuthorizationHeader']).not.toHaveBeenCalled();
  });

  it('should set the profile in dataService if access_token is provided and valid', () => {
    const mockAccessToken = 'validAccessToken';
    const mockResponse: DiscordUser = { id: '123', username: 'testUser' } as DiscordUser;
    const headersSpy = jest.spyOn(service['headers'], 'set').mockReturnValue(service['headers']);
    const httpSpy = jest.spyOn(TestBed.inject(HttpClient), 'get').mockReturnValue(of(mockResponse));

    (service as any).isValidToken(mockAccessToken);

    expect(headersSpy).toHaveBeenCalledWith('Authorization', `Bearer ${mockAccessToken}`);
    expect(httpSpy).toHaveBeenCalled();
    expect(dataService.profile).toEqual(mockResponse);

    headersSpy.mockRestore();
    httpSpy.mockRestore();
  });

  it('should remove access_token and redirect to EXPIRED if the token is invalid', () => {
    const mockErrorResponse = new HttpErrorResponse({ status: 401 });
    httpClientSpy.mockReturnValue(throwError(() => mockErrorResponse));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    (service as any).isValidToken();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(redirectSpy).toHaveBeenCalledWith('EXPIRED');
  });

  it('should remove access_token and redirect to UNKNOWN if an unknown error occurs', () => {
    const mockErrorResponse = new HttpErrorResponse({ status: 500 });
    httpClientSpy.mockReturnValue(throwError(() => mockErrorResponse));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    (service as any).isValidToken();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
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

  it('should return the original Discord token if decryption is successful', () => {
    const mockToken = 'mockToken';
    const mockDecodedToken = { sub: 'originalDiscordToken' };
    jwtHelperSpy.mockReturnValue(mockDecodedToken);

    const result = (service as any).decryptToken(mockToken);

    expect(result).toBe('originalDiscordToken');
    expect(jwtHelperSpy).toHaveBeenCalledWith(mockToken);
  });

  it('should redirect to INVALID error page if decryption fails', () => {
    jwtHelperSpy.mockImplementation(() => { throw new Error('Decryption failed'); });
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    const result = (service as any).decryptToken('invalidToken');

    expect(result).toBe('');
    expect(redirectSpy).toHaveBeenCalledWith('INVALID');
  });

  it('should check if user has admin permissions', () => {
    const permString = '8'; // Binary: 1000, which includes the admin permission bit
    const nonAdminPermString = '4'; // Binary: 0100, which does not include the admin permission bit

    expect(service.isAdmin(permString)).toBe(true);
    expect(service.isAdmin(nonAdminPermString)).toBe(false);
  });

  it('should remove access_token from localStorage and navigate to home page on logout', () => {
    localStorage.setItem('access_token', 'testToken');
    service.logout();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(routerSpy).toHaveBeenCalledWith('/');
  });

  it('should redirect to Discord if no code or state is present and not on error page', () => {
    const queryParamsSpy = jest.spyOn(route.queryParams, 'subscribe').mockImplementation((callback) => {
      if (callback) {
        callback({ code: null, state: null });
      }
      return of().subscribe();
    });
    const appendStateSpy = jest.spyOn(service as any, 'appendState');
    const windowSpy = jest.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
      pathname: '/not-errors'
    });

    localStorage.removeItem('access_token');
    service.discordLogin();

    expect(appendStateSpy).toHaveBeenCalled();
    expect(windowSpy).toHaveBeenCalled();
    queryParamsSpy.mockRestore();
    appendStateSpy.mockRestore();
    windowSpy.mockRestore();
  });

  it('should call isValidToken if access_token is present', () => {
    localStorage.setItem('access_token', 'test');
    const queryParamsSpy = jest.spyOn(route.queryParams, 'subscribe').mockImplementation((callback) => {
      if (callback) {
        callback({ code: null, state: null });
      }
      return of().subscribe();
    });
    const isValidTokenSpy = jest.spyOn(service as any, 'isValidToken');

    service.discordLogin();

    expect(isValidTokenSpy).toHaveBeenCalled();
    queryParamsSpy.mockRestore();
    isValidTokenSpy.mockRestore();
  });

  it('should call authenticateUser if code and state are present', () => {
    const queryParamsSpy = jest.spyOn(route.queryParams, 'subscribe').mockImplementation((callback) => {
      if (callback) {
        callback({ code: 'testCode', state: 'testState' });
      }
      return of().subscribe();
    });
    const authenticateUserSpy = jest.spyOn(service as any, 'authenticateUser');

    service.discordLogin();

    expect(authenticateUserSpy).toHaveBeenCalledWith('testCode', 'testState');
    queryParamsSpy.mockRestore();
    authenticateUserSpy.mockRestore();
  });

});
