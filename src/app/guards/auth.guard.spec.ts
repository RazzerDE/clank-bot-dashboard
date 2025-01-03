import { TestBed } from '@angular/core/testing';
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from '@angular/router';
import {AuthGuard} from "./auth.guard";
import {AuthService} from "../services/auth/auth.service";
import {DataHolderService} from "../services/data/data-holder.service";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, of, throwError} from "rxjs";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {TranslateModule} from "@ngx-translate/core";


describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => AuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: {} } },
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should handle Discord callback with code and state', () => {
    const authService = TestBed.inject(AuthService);
    const route = {queryParams: {code: 'testCode', state: 'testState'}} as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const authSpy = jest.spyOn(authService, 'authenticateUser').mockImplementation(() => {});

    const result = executeGuard(route, state);

    expect(authSpy).toHaveBeenCalledWith('testCode', 'testState', true);
    if (result instanceof Observable) {
      result.subscribe(res => {
        expect(res).toEqual(true);
      });
    } else {
      expect(result).toEqual(of(true));
    }
  });

  it('should redirect to Discord login if no access token', () => {
    const authService = TestBed.inject(AuthService);
    const route = { queryParams: {} } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const loginSpy = jest.spyOn(authService, 'discordLogin').mockImplementation(() => {});
    localStorage.removeItem('access_token');

    const result = executeGuard(route, state);

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(loginSpy).toHaveBeenCalled();
    if (result instanceof Observable) {
      result.subscribe(res => {
        expect(res).toEqual(false);
      });
    } else {
      expect(result).toEqual(of(false));
    }
  });

  it('should verify existing token and set profile', () => {
    const dataService = TestBed.inject(DataHolderService);
    const http = TestBed.inject(HttpClient);
    const route = { queryParams: {} } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const profile = { id: '123', username: 'testUser' } as any;
    const httpSpy = jest.spyOn(http, 'get').mockReturnValue(of(profile));

    localStorage.setItem('access_token', 'testToken');

    const result = executeGuard(route, state);

    if (result instanceof Observable) {
      result.subscribe(res => {
        expect(res).toBe(true);
        expect(httpSpy).toHaveBeenCalled();
        expect(dataService.profile).toEqual(profile);
      });
    } else {
      expect(result).toBe(true);
      expect(httpSpy).toHaveBeenCalled();
      expect(dataService.profile).toEqual(profile);
    }
  });

  it('should handle 401 error and redirect to EXPIRED', () => {
    const dataService = TestBed.inject(DataHolderService);
    const http = TestBed.inject(HttpClient);
    const route = { queryParams: {} } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const httpSpy = jest.spyOn(http, 'get').mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401 })));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    localStorage.setItem('access_token', 'testToken');

    const result = executeGuard(route, state);

    if (result instanceof Observable) {
      result.subscribe((res: any) => {
        expect(res).toBe(false);
        expect(httpSpy).toHaveBeenCalled();
        expect(localStorage.getItem('access_token')).toBeNull();
        expect(redirectSpy).toHaveBeenCalledWith('EXPIRED');
      });
    } else {
      expect(result).toBe(false);
      expect(httpSpy).toHaveBeenCalled();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(redirectSpy).toHaveBeenCalledWith('EXPIRED');
    }
  });

  it('should handle unknown error and redirect to UNKNOWN', () => {
    const dataService = TestBed.inject(DataHolderService);
    const http = TestBed.inject(HttpClient);
    const route = { queryParams: {} } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const httpSpy = jest.spyOn(http, 'get').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError');

    localStorage.setItem('access_token', 'testToken');

    const result = executeGuard(route, state);

    if (result instanceof Observable) {
      result.subscribe(res => {
        expect(res).toBe(false);
        expect(httpSpy).toHaveBeenCalled();
        expect(localStorage.getItem('access_token')).toBeNull();
        expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
      });
    } else {
      expect(result).toBe(false);
      expect(httpSpy).toHaveBeenCalled();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    }
  });
});
