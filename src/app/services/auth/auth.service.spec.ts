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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: {}, queryParams: of({}) }}]
    });

    localStorage.setItem('access_token', 'test');
    service = TestBed.inject(AuthService);
    dataService = TestBed.inject(DataHolderService);
    route = TestBed.inject(ActivatedRoute);
    jwtHelperSpy = jest.spyOn(service['jwtHelper'], 'decodeToken');
    httpClientSpy = jest.spyOn(TestBed.inject(HttpClient), 'get') as jest.SpyInstance;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    localStorage.removeItem('access_token');
  });

  it('should authenticate user and store access token on successful response', () => {
    const mockResponse = { access_token: 'encryptedToken' };
    const decryptedToken = 'decryptedToken';
    jest.spyOn(service as any, 'decryptToken').mockReturnValue(decryptedToken);
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(of(mockResponse));
    const navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigateByUrl');

    localStorage.setItem('state', btoa('testState'));
    localStorage.setItem('state_expiry', (Date.now() + 10000).toString());

    (service as any).authenticateUser('testCode', 'testState');

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

  it('should log the response if the token is valid', () => {
    const mockResponse: DiscordUser = {} as DiscordUser;
    httpClientSpy.mockReturnValue(of(mockResponse));
    const consoleSpy = jest.spyOn(console, 'log');

    (service as any).isValidToken();

    expect(consoleSpy).toHaveBeenCalledWith(mockResponse);
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

  it('should call redirectLoginError with UNKNOWN if state save fails', () => {
    jest.spyOn(service as any, 'generateSecureState').mockReturnValue('testState');
    const postSpy = jest.spyOn(TestBed.inject(HttpClient), 'post').mockReturnValue(throwError(() => new Error('Error')));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    (service as any).appendState();

    expect(postSpy).toHaveBeenCalledWith(`http://localhost:8081/auth/saveState`, { state: 'testState' });
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  });

  it('should replace state in authUrl if it already exists', () => {
    jest.spyOn(service as any, 'generateSecureState').mockReturnValue('testState');
    service['authUrl'] = 'https://discord.com/oauth2/authorize?client_id=test&state=oldState';

    (service as any).appendState();

    expect(service['authUrl']).toContain(`state=${encodeURIComponent('testState')}`);
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
