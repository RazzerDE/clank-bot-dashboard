import { TestBed } from '@angular/core/testing';
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
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

  it("should return false if isLoginLoading is true", () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    dataService.isLoginLoading = true;

    const result = executeGuard(route, state);

    if (result instanceof Observable) {
      result.subscribe(res => {
        expect(res).toBe(false);
      });
    } else {
      expect(result).toBe(false);
    }
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
    const router = TestBed.inject(Router);
    const route = {queryParams: {}, routeConfig: { path: 'someOtherPath' }} as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    dataService['active_guild'] = null;
    dataService['isLoginLoading'] = false;

    const routerSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const result = executeGuard(route, state);

    expect(routerSpy).toHaveBeenCalledWith('/dashboard');
    expect(dataService.isLoginLoading).toBe(false);

    if (result instanceof Observable) {
      result.subscribe(res => {
        expect(res).toBe(false);
      });
    } else {
      expect(result).toBe(false);
    }
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
