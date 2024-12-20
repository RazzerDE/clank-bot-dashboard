import { Injectable } from '@angular/core';
import {GeneralStats} from "../types/Statistics";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class DataHolderService {
  isLoading: boolean = true;

  bot_stats: GeneralStats = { user_count: '28.000', guild_count: 350, giveaway_count: 130, ticket_count: 290,
                              punish_count: 110, global_verified_count: '16.000' };

  // error handler related
  error_title: string = '';
  error_desc: string = '';

  constructor(private translate: TranslateService, private router: Router) {
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

}
