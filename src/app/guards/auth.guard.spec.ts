import { TestBed } from '@angular/core/testing';
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from '@angular/router';
import {AuthGuard} from "./auth.guard";
import {AuthService} from "../services/auth/auth.service";
import {DataHolderService} from "../services/data/data-holder.service";
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {Observable, of, throwError} from "rxjs";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import {TranslateModule} from "@ngx-translate/core";
import {Guild} from "../services/types/discord/Guilds";


describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => AuthGuard(...guardParameters));
  let dataService: DataHolderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot()],
    providers: [
        { provide: ActivatedRoute, useValue: { queryParams: {} } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
    });

    dataService = TestBed.inject(DataHolderService);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should handle Discord callback with code and state', () => {
    const authService = TestBed.inject(AuthService);
    const route = {queryParams: {code: 'testCode', state: 'testState'}} as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    dataService['active_guild'] = { id: '123', name: 'Test Guild' } as Guild;

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
    dataService['active_guild'] = { id: '123', name: 'Test Guild' } as Guild;

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
    dataService['active_guild'] = { id: '123', name: 'Test Guild' } as Guild;

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
    dataService['active_guild'] = { id: '123', name: 'Test Guild' } as Guild;

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
    const redirectSpy = jest.spyOn(dataService, 'redirectLoginError').mockImplementation(() => {});
    dataService['active_guild'] = { id: '123', name: 'Test Guild' } as Guild;

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

  it('should redirect to dashboard if active_guild is not set and path is not dashboard or dashboard/contact', () => {
    const dataService = TestBed.inject(DataHolderService);
    const route = {queryParams: {}, routeConfig: { path: 'someOtherPath' }} as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    dataService['active_guild'] = null;

    // window.location.href ist in JSDOM nicht implementiert, daher mocken wir es:
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: '/dashboard/events/view' };

    localStorage.setItem('access_token', 'testToken');

    const result = executeGuard(route, state);

    if (result instanceof Observable) {
      result.subscribe(res => {
        expect(res).toBe(false);
      });
    }
    expect(window.location.href).toBe('/dashboard');

    // @ts-ignore
    window.location = originalLocation;
  });

  it('should not redirect if active_guild is not set but path is dashboard', () => {
    const http = TestBed.inject(HttpClient);
    const dataService = TestBed.inject(DataHolderService);
    const route = {queryParams: {}, routeConfig: { path: 'dashboard' }} as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const profile = { id: '123', username: 'testUser' } as any;
    dataService['active_guild'] = null;

    const httpSpy = jest.spyOn(http, 'get').mockReturnValue(of(profile));
    localStorage.setItem('access_token', 'testToken');
    const result = executeGuard(route, state);

    expect(httpSpy).toHaveBeenCalled();
    if (result instanceof Observable) {
      result.subscribe(res => {
        expect(res).toBe(true);
        expect(dataService.profile).toEqual(profile);
      });
    }
  });

  it('should not redirect if active_guild is not set but path is dashboard/contact', () => {
    const http = TestBed.inject(HttpClient);
    const dataService = TestBed.inject(DataHolderService);
    const route = {queryParams: {}, routeConfig: { path: 'dashboard/contact' }} as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const profile = { id: '123', username: 'testUser' } as any;
    dataService['active_guild'] = null;

    const httpSpy = jest.spyOn(http, 'get').mockReturnValue(of(profile));
    localStorage.setItem('access_token', 'testToken');
    const result = executeGuard(route, state);

    expect(httpSpy).toHaveBeenCalled();
    if (result instanceof Observable) {
      result.subscribe(res => {
        expect(res).toBe(true);
        expect(dataService.profile).toEqual(profile);
      });
    }
  });

  it('should proceed with authentication if active_guild is set', () => {
    const http = TestBed.inject(HttpClient);
    const route = {queryParams: {}, routeConfig: { path: 'someOtherPath' }} as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const profile = { id: '123', username: 'testUser' } as any;
    dataService['active_guild'] = { id: '123', name: 'Test Guild' } as Guild;

    const httpSpy = jest.spyOn(http, 'get').mockReturnValue(of(profile));
    localStorage.setItem('access_token', 'testToken');
    const result = executeGuard(route, state);

    expect(httpSpy).toHaveBeenCalled();
    if (result instanceof Observable) {
      result.subscribe(res => {
        expect(res).toBe(true);
        expect(dataService.profile).toEqual(profile);
      });
    }
  });
});
