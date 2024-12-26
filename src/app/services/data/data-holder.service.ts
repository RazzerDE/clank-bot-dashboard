import { Injectable } from '@angular/core';
import {GeneralStats} from "../types/Statistics";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class DataHolderService {
  isLoading: boolean = true;
  isDarkTheme: boolean = false;
  showSidebarLogo: boolean = false;

  bot_stats: GeneralStats = { user_count: '28.000', guild_count: 350, giveaway_count: 130, ticket_count: 290,
                              punish_count: 110, global_verified_count: '16.000' };

  // error handler related
  error_title: string = '';
  error_desc: string = '';

  constructor(private translate: TranslateService, private router: Router) {
    if (localStorage.getItem('active_guild')) {
      this.showSidebarLogo = true;
    }

    // check if translations are loaded
    this.translate.onLangChange.subscribe((): void => {
      this.error_title = this.translate.instant("ERROR_UNKNOWN_TITLE");
      this.error_desc = this.translate.instant("ERROR_UNKNOWN_DESC");
    });
  }

  /**
   * Redirects the user to a simple error page with a specific error type.
   *
   * This method sets the error title and description based on the provided error type
   * and navigates the user to the `/errors/simple` page.
   *
   * @param {'LOGIN_INVALID' | 'LOGIN_EXPIRED' | 'LOGIN_BLOCKED' | 'UNKNOWN'} type - The type of error to display.
   */
  redirectLoginError(type: 'INVALID' | 'EXPIRED' | 'BLOCKED' | 'UNKNOWN'): void {
    if (type === 'UNKNOWN') {
      this.error_title = this.translate.instant("ERROR_UNKNOWN_TITLE");
      this.error_desc = this.translate.instant("ERROR_UNKNOWN_DESC");
    } else {
      this.error_title = this.translate.instant(`ERROR_LOGIN_${type}_TITLE`);
      this.error_desc = this.translate.instant(`ERROR_LOGIN_${type}_DESC`);
    }

    this.router.navigateByUrl(`/errors/simple`).then();
  }

  /**
   * Retrieves the theme preference from local storage or the user's system settings.
   *
   * @returns {boolean} - `true` if the theme is dark, otherwise `false`.
   */
  getThemeFromLocalStorage(): boolean {
    const darkMode: string | null = localStorage.getItem('dark');
    if (darkMode !== null) {
      return darkMode === 'true';
    }

    // check user's system theme
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  /**
   * Toggles the theme between light and dark mode.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('dark', this.isDarkTheme.toString());
    this.applyTheme();
  }

  /**
   * Applies the current theme to the document
   */
  applyTheme(): void {
    const html: HTMLHtmlElement = document.querySelector('html') as HTMLHtmlElement;
    if (html) {
      if (this.isDarkTheme) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }

}
