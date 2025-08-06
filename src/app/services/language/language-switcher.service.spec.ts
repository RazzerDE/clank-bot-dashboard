import { TestBed } from '@angular/core/testing';

import { LanguageSwitcherService } from './language-switcher.service';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {nav_items} from "../types/landing-page/LNavigationItem";
import {Location} from "@angular/common";
import {PLATFORM_ID} from "@angular/core";

describe('LanguageSwitcherService', () => {
  let service: LanguageSwitcherService;
  let translateService: TranslateService;
  let loc: Location;
  let platformId: string = 'browser'; // Simulating a browser platform for testing

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [Location, { provide: PLATFORM_ID, useValue: platformId }]
    });
    service = TestBed.inject(LanguageSwitcherService);
    translateService = TestBed.inject(TranslateService);
    loc = TestBed.inject(Location);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the language to the provided value and save it to localStorage', () => {
    const lang = 'fr';
    const useSpy = jest.spyOn(translateService, 'use');
    service.setLanguage(lang);
    expect(localStorage.getItem('lang')).toBe(lang);
    expect(useSpy).toHaveBeenCalledWith(lang);
  });

  it('should set the language to the saved language in localStorage if no language is provided', () => {
    const savedLang = 'de';
    localStorage.setItem('lang', savedLang);
    const useSpy = jest.spyOn(translateService, 'use');
    service.setLanguage();
    expect(localStorage.getItem('lang')).toBe(savedLang);
    expect(useSpy).toHaveBeenCalledWith(savedLang);
  });

  it('should update the header item title after setting the language', (done) => {
    const lang = 'it';
    jest.spyOn(translateService, 'instant').mockReturnValue('HEADER_LANDING_ITEM_BOT_SETUP');
    service.setLanguage(lang);
    setTimeout(() => {
      expect(nav_items[2].title).toBe('HEADER_LANDING_ITEM_BOT_SETUP');
      done();
    }, 50);
  });

  it('should set the language to the browser language or default to "en" if no language is provided and none is saved in localStorage', () => {
    localStorage.removeItem('lang');
    const getBrowserLangSpy = jest.spyOn(translateService, 'getBrowserLang').mockReturnValue(undefined);
    const useSpy = jest.spyOn(translateService, 'use');

    service.setLanguage();

    expect(getBrowserLangSpy).toHaveBeenCalled();
    expect(useSpy).toHaveBeenCalledWith('en');
    expect(localStorage.getItem('lang')).toBe('en');
  });

  it('should set the language to "en" if the browser language is neither "de" nor "en"', () => {
    localStorage.removeItem('lang');
    const browserLang = 'fr';

    jest.spyOn(translateService, 'getBrowserLang').mockReturnValue(browserLang);
    const useSpy = jest.spyOn(translateService, 'use');

    service.setLanguage();

    expect(useSpy).toHaveBeenCalledWith('en');
    expect(localStorage.getItem('lang')).toBe('en');
  });

  it("should set the language to 'de' if the path ends with 'de' on server-side", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({imports: [TranslateModule.forRoot()],
      providers: [Location, { provide: PLATFORM_ID, useValue: 'server' }, { provide: TranslateService, useValue: { use: jest.fn()}}]});
    service = TestBed.inject(LanguageSwitcherService);
    loc = TestBed.inject(Location);
    translateService = TestBed.inject(TranslateService);

    jest.spyOn(loc, 'path').mockReturnValue('/some/path/de');

    TestBed.runInInjectionContext((): void => {
      service.setLanguage();
      expect(translateService.use).toHaveBeenCalledWith('de');

      jest.spyOn(loc, 'path').mockReturnValue('/some/path/en');
      service.setLanguage();
      expect(translateService.use).toHaveBeenCalledWith('en');
    });
  });

  it('should return the current language from the translate service', () => {
    const mockCurrentLang = 'de';
    jest.spyOn(translateService, 'currentLang', 'get').mockReturnValue(mockCurrentLang);

    const result = service.getLanguage();

    expect(result).toBe(mockCurrentLang);
  });
});
