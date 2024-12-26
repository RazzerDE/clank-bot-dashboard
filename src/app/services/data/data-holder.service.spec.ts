import { TestBed } from '@angular/core/testing';

import { DataHolderService } from './data-holder.service';
import {TranslateModule} from "@ngx-translate/core";
import {Router} from "@angular/router";

describe('DataHolderService', () => {
  let service: DataHolderService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()]
    });

    localStorage.setItem('active_guild', 'true');
    router = TestBed.inject(Router);
    service = TestBed.inject(DataHolderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should redirect to error page with correct title and description for UNKNOWN error', () => {
    const translateSpy = jest.spyOn(service['translate'], 'instant');
    const routerSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    service.redirectLoginError('UNKNOWN');

    expect(translateSpy).toHaveBeenCalledWith('ERROR_UNKNOWN_TITLE');
    expect(translateSpy).toHaveBeenCalledWith('ERROR_UNKNOWN_DESC');
    expect(service.error_title).toBe('ERROR_UNKNOWN_TITLE');
    expect(service.error_desc).toBe('ERROR_UNKNOWN_DESC');
    expect(routerSpy).toHaveBeenCalledWith('/errors/simple');
  });

  it('should redirect to error page with correct title and description for other error types', () => {
    const translateSpy = jest.spyOn(service['translate'], 'instant');
    const routerSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    service.redirectLoginError('INVALID');

    expect(translateSpy).toHaveBeenCalledWith('ERROR_LOGIN_INVALID_TITLE');
    expect(translateSpy).toHaveBeenCalledWith('ERROR_LOGIN_INVALID_DESC');
    expect(service.error_title).toBe('ERROR_LOGIN_INVALID_TITLE');
    expect(service.error_desc).toBe('ERROR_LOGIN_INVALID_DESC');
    expect(routerSpy).toHaveBeenCalledWith('/errors/simple');
  });

  it('should return true if darkMode is set to "true" in localStorage', () => {
    localStorage.setItem('dark', 'true');

    const result: boolean = service.getThemeFromLocalStorage();

    expect(result).toBe(true);

    localStorage.removeItem('dark');
  });

  it('should toggle the theme and update localStorage', () => {
    const applyThemeSpy = jest.spyOn(service, 'applyTheme');
    service.isDarkTheme = false;

    service.toggleTheme();

    expect(service.isDarkTheme).toBe(true);
    expect(localStorage.getItem('dark')).toBe('true');
    expect(applyThemeSpy).toHaveBeenCalled();

    service.toggleTheme();

    expect(service.isDarkTheme).toBe(false);
    expect(localStorage.getItem('dark')).toBe('false');
    expect(applyThemeSpy).toHaveBeenCalledTimes(2);
  });

  it('should toggle the visibility of the mobile sidebar', () => {
    const initialVisibility = service.showMobileSidebar;
    service.toggleSidebar();
    expect(service.showMobileSidebar).toBe(!initialVisibility);
  });

});
