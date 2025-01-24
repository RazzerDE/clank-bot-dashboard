import { Injectable } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

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
    if (!lang) {
      // language already saved
      if (localStorage.getItem('lang')) {
        lang = localStorage.getItem('lang')!;
      } else {
        // get browser language
        lang = this.translate.getBrowserLang() || 'en';
        if (lang !== 'de' && lang !== 'en') {
          lang = 'en';
        }
      }
    }

    localStorage.setItem('lang', lang);
    this.translate.use(lang);
  }

  /**
   * Returns the current language code.
   */
  getLanguage(): string {
    return this.translate.currentLang;
  }
}
