import { TestBed } from '@angular/core/testing';

import { LanguageSwitcherService } from './language-switcher.service';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {nav_items} from "../pages/landing-page/header/types/LNavigationItem";

describe('LanguageSwitcherService', () => {
  let service: LanguageSwitcherService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()]
    });
    service = TestBed.inject(LanguageSwitcherService);
    translateService = TestBed.inject(TranslateService);
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
});
