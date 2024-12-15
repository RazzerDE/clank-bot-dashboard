import { Injectable } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {nav_items} from "../pages/landing-page/header/types/LNavigationItem";

@Injectable({
  providedIn: 'root'
})
export class LanguageSwitcherService {

  constructor(private translate: TranslateService) {}

  /**
   * Sets the application language.
   *
   * If no language is provided, it attempts to load the default language
   * from the browser or a saved language from localStorage. If a language
   * is provided, it saves it to localStorage.
   *
   * @param lang - The language code to set (optional).
   */
  setLanguage(lang?: string): void {
    if (!lang) { // load default language or saved one
      lang = this.translate.getBrowserLang() || 'en';
      if (localStorage.getItem('lang')) {
        lang = localStorage.getItem('lang')!;
      }
    }

    localStorage.setItem('lang', lang);
    this.translate.use(lang);

    // update header item; its set in a interface type so update it manually
    setTimeout(() => { nav_items[2].title = this.translate.instant('HEADER_LANDING_ITEM_BOT_SETUP'); }, 50);
  }

  /**
   * Returns the current language code.
   */
  getLanguage(): string {
    return this.translate.currentLang;
  }
}
