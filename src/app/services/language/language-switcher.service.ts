import {inject, Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {isPlatformBrowser, Location} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class LanguageSwitcherService {

  constructor(private translate: TranslateService, @Inject(PLATFORM_ID) private platformId: Object) {}

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
      if (isPlatformBrowser(this.platformId)) { // only lang in browser
        const savedLang: string | null = localStorage.getItem('lang');
        if (savedLang) { lang = savedLang;
        } else { // try to get browser language
          lang = this.translate.getBrowserLang() || 'en';
          if (lang !== 'de' && lang !== 'en') {
            lang = 'en';
          }
        }
      } else {
        const location: Location = inject(Location);
        lang = location.path().endsWith('de') ? 'de' : 'en';  // server-side language detection
      }
    }

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }

    this.translate.use(lang);
  }

  /**
   * Returns the current language code.
   */
  getLanguage(): string {
    return this.translate.currentLang;
  }
}
