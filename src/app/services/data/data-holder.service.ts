import {Injectable} from '@angular/core';
import {GeneralStats} from "../types/Statistics";
import {Router} from "@angular/router";
import {DiscordUser} from "../types/discord/User";
import {Subject, Subscription} from "rxjs";
import {Channel, Emoji, Guild, initEmojis, Role} from "../types/discord/Guilds";
import {HttpErrorResponse} from "@angular/common/http";
import {SupportTheme, TicketSnippet} from "../types/Tickets";
import {ComService} from "../discord-com/com.service";
import {TranslateService} from "@ngx-translate/core";
import {MarkdownPipe} from "../../pipes/markdown/markdown.pipe";
import {ConvertTimePipe} from "../../pipes/convert-time.pipe";
import {EmbedConfig} from "../types/Config";
import {ApiService} from "../api/api.service";

@Injectable({
  providedIn: 'root'
})
export class DataHolderService {
  isLoading: boolean = true;
  isEmojisLoading: boolean = true;
  isDarkTheme: boolean = false;
  isFetching: boolean = false;
  isFAQ: boolean = false;
  showSidebarLogo: boolean = false;
  showMobileSidebar: boolean = false;
  showEmojiPicker: boolean = false;
  hideGuildSidebar: boolean = false;
  allowDataFetch: Subject<boolean> = new Subject<boolean>();

  // error handler related
  error_title: string = 'ERROR_UNKNOWN_TITLE';
  error_desc: string = 'ERROR_UNKNOWN_DESC';
  error_color: 'red' | 'green' = 'red';
  faq_answer: string = '';
  showAlertBox: boolean = false;

  // api related
  active_guild: Guild | null = null;
  profile: DiscordUser | null = null;
  bot_stats: GeneralStats = { user_count: '28.000', guild_count: 350, giveaway_count: 130, ticket_count: 290,
                              punish_count: 110, global_verified_count: '16.000' };
  readonly initTheme: SupportTheme = { id: "0", name: '', icon: '🌟', desc: '', faq_answer: '', roles: [],
                                    default_roles: [], pending: true, action: 'CREATE' };
  support_themes: SupportTheme[] = [];
  guild_roles: Role[] = [];
  guild_channels: Channel[] = [];
  guild_emojis: Emoji[] | string[] = [];
  embed_config: EmbedConfig = { color_code: '#706fd3', thumbnail_url: 'https://i.imgur.com/8eajG1v.gif',
    banner_url: null, emoji_reaction: this.getEmojibyId('<a:present:873708141085343764>') }
  selectedSnippet: TicketSnippet | null = null;

  private markdownPipe: MarkdownPipe = new MarkdownPipe();
  private convertTimePipe: ConvertTimePipe = new ConvertTimePipe();

  constructor(private router: Router, private translate: TranslateService) {
    const temp_guild: string | null = localStorage.getItem('active_guild');
    if (temp_guild) {
      this.showSidebarLogo = true;
      this.active_guild = JSON.parse(temp_guild) as Guild;
    }
  }

  /**
   * Fetches the roles of the active guild from the Discord API.
   *
   * This method checks if the roles are cached in local storage and uses the cache
   * if it is valid (less than one minute old). If the cache is invalid or `no_cache`
   * is set to `true`, it fetches the roles from the API and updates the cache.
   *
   * @param discordService - The service used to communicate with the Discord API.
   * @param loading - Optional flag to indicate if the loading state should be set (default: `true`).
   * @param no_cache - Optional flag to bypass the cache and fetch fresh data (default: `false`).
   */
  getGuildRoles(discordService: ComService, loading?: boolean, no_cache?: boolean): void {
    if (!this.active_guild || this.isFetching) { return; }
    if (loading) { this.isFetching = true; }

    // check if guilds are already stored in local storage (5 minute cache)
    if ((localStorage.getItem('guild_roles') && localStorage.getItem('guild_roles_timestamp') &&
      Date.now() - Number(localStorage.getItem('guild_roles_timestamp')) < 300000) && !no_cache) {
      this.guild_roles = JSON.parse(localStorage.getItem('guild_roles') as string) as Role[];
      if (loading) { this.isFetching = false; }
      return;
    }

    discordService.getGuildRoles(this.active_guild.id).then((observable) => {
      const subscription: Subscription = observable.subscribe({
        next: (response: Role[]): void => {
          this.guild_roles = response;
          if (loading) { this.isFetching = false; }

          localStorage.setItem('guild_roles', JSON.stringify(this.guild_roles));
          localStorage.setItem('guild_roles_timestamp', Date.now().toString());
          subscription.unsubscribe();
        },
        error: (err: HttpErrorResponse): void => {
          this.handleApiError(err);
          subscription.unsubscribe();
        }
      });
    });
  }

  /**
   * Fetches the channels of the active guild from the Discord API.
   *
   * This method checks if the channels are cached in local storage and uses the cache
   * if it is valid (less than one minute old). If the cache is invalid or `no_cache`
   * is set to `true`, it fetches the channels from the API and updates the cache.
   *
   * @param discordService - The service used to communicate with the Discord API.
   * @param no_cache - Optional flag to bypass the cache and fetch fresh data (default: `false`).
   */
  getGuildChannels(discordService: ComService, no_cache?: boolean): void {
    if (!this.active_guild) { return; }
    this.isFetching = true;

    // check if guilds are already stored in local storage (one minute cache)
    if ((localStorage.getItem('guild_channels') && localStorage.getItem('guild_channels_timestamp') &&
      Date.now() - Number(localStorage.getItem('guild_channels_timestamp')) < 60000) && !no_cache) {
      this.guild_channels = JSON.parse(localStorage.getItem('guild_channels') as string) as Channel[];
      this.isFetching = false;
      return;
    }

    discordService.getGuildChannels(this.active_guild.id).then((observable) => {
      const subscription: Subscription = observable.subscribe({
        next: (response: Channel[]): void => {
          this.guild_channels = response;
          this.isFetching = false;

          localStorage.setItem('guild_channels', JSON.stringify(this.guild_channels));
          localStorage.setItem('guild_channels_timestamp', Date.now().toString());
          subscription.unsubscribe();
        },
        error: (err: HttpErrorResponse): void => {
          this.handleApiError(err);
          subscription.unsubscribe();
        }
      });
    });
  }

  /**
   * Fetches the emojis for the current guild, using a 5-minute cache.
   *
   * If the emojis are already cached in localStorage and the cache is still valid (less than 5 minutes old),
   * the cached emojis are loaded. Otherwise, the emojis are fetched from the server.
   *
   * @param {ComService} comService - The service used to communicate with the Discord API.
   * @param {boolean} [no_cache] - Optional flag to force bypassing the cache and fetch fresh data.
   */
  getGuildEmojis(comService: ComService, no_cache?: boolean): void {
    if (!this.active_guild) { return; }
    this.isEmojisLoading = true;

    // check if guilds are already stored in local storage (5 minute cache)
    if ((localStorage.getItem('guild_emojis') && localStorage.getItem('guild_emojis_timestamp') &&
      Date.now() - Number(localStorage.getItem('guild_emojis_timestamp')) < 300000) && !no_cache) {
      this.guild_emojis = JSON.parse(localStorage.getItem('guild_emojis') as string);
      if (this.guild_emojis.length === 0) {
        this.guild_emojis = initEmojis;
      }

      this.isEmojisLoading = false;
      this.isLoading = false;
      return;
    }

    let subscription: Subscription | null = null;
    comService.getGuildEmojis(this.active_guild.id).then((observable) => {
      subscription = observable.subscribe({
        next: (response: Emoji[]): void => {
          this.guild_emojis = response;
          this.isEmojisLoading = false;
          localStorage.setItem('guild_emojis', JSON.stringify(this.guild_emojis));
          localStorage.setItem('guild_emojis_timestamp', Date.now().toString());
          if (subscription) { subscription.unsubscribe(); }
        },
        error: (err: HttpErrorResponse): void => {
          if (subscription) { subscription.unsubscribe(); }
          if (err.status === 429) {
            this.redirectLoginError('REQUESTS');
          } else if (err.status === 401) {
            this.redirectLoginError('NO_CLANK');
          } else {
            this.redirectLoginError('EXPIRED');
          }
        }
      });
    });
  }

  /**
   * Retrieves the event embed configuration for the current guild.
   *
   * This method first checks if a valid configuration is available in localStorage (cached for 30 seconds).
   * If so, it loads the configuration from the cache. Otherwise, it fetches the configuration from the API,
   * updates the local cache, and handles loading states. Handles HTTP errors by redirecting to appropriate error pages.
   *
   * @param {ApiService} apiService - The service used to communicate with the API.
   * @param {ComService} comService - Another service used to communicate with the API.
   * @param {boolean} [no_cache] - If true, ignores the cache and fetches fresh data from the API.
   * @returns {void}
   */
  getEventConfig(apiService: ApiService, comService: ComService, no_cache?: boolean): void {
    if (!this.active_guild) { return; }
    this.isFetching = true;

    // check if guilds are already stored in local storage (30 seconds cache)
    if ((localStorage.getItem('gift_config') && localStorage.getItem('gift_config_timestamp') &&
      Date.now() - Number(localStorage.getItem('gift_config_timestamp')) < 30000 && !no_cache)) {
      this.embed_config = JSON.parse(localStorage.getItem('gift_config') as string);
      if (typeof this.embed_config.color_code === 'number') {
        this.embed_config.color_code = `#${this.embed_config.color_code.toString(16).padStart(6, '0')}`;
      }

      setTimeout((): void => { this.getGuildEmojis(comService, no_cache) }, 100);
      this.isLoading = false;
      this.isFetching = false;
      return;
    }

    const sub: Subscription = apiService.getEventConfig(this.active_guild!.id)
      .subscribe({
        next: (config: EmbedConfig): void => {
          if (typeof config.color_code === 'number') {
            config.color_code = `#${config.color_code.toString(16).padStart(6, '0')}`;
          }

          this.embed_config = config;
          this.isLoading = false;
          this.isFetching = false;

          setTimeout((): void => { this.getGuildEmojis(comService, no_cache) }, 500);
          localStorage.setItem('gift_config', JSON.stringify(this.embed_config));
          localStorage.setItem('gift_config_timestamp', Date.now().toString());
          sub.unsubscribe();
        },
        error: (err: HttpErrorResponse): void => {
          this.isLoading = false;
          this.isFetching = false;

          if (err.status === 429) {
            this.redirectLoginError('REQUESTS');
            return;
          } else if (err.status === 0) {
            this.redirectLoginError('OFFLINE');
            return;
          } else {
            this.redirectLoginError('UNKNOWN');
          }
          sub.unsubscribe();
        }
      });
  }

  /**
   * Extracts the emoji ID from a Discord emoji string and returns the corresponding CDN URL.
   * Discord emojis are formatted as `<:name:id>` for standard emojis or `<a:name:id>` for animated emojis.
   *
   * @param emoji - The Discord emoji string format (e.g., '<:emojiname:123456789>' or '<a:emojiname:123456789>')
   * @param isID - Optional boolean to indicate if the input is the ID of the emoji (default: false)
   * @param isAnimated - Optional boolean to indicate if the emoji is animated (default: false)
   * @returns The CDN URL for the emoji, or an empty string if the emoji format is invalid
   */
  getEmojibyId(emoji: string, isID?: boolean, isAnimated?: boolean): string {
    if (!emoji) { return emoji; }
    if (isID) { return `https://cdn.discordapp.com/emojis/${emoji}.${isAnimated ? 'gif' : 'png'}`; }

    // Match emoji format <:name:id> or <a:name:id>
    const match: RegExpMatchArray | null = emoji.match(/<(a?):(\w+):(\d+)>/);
    if (!match) return emoji;

    const emojiId: string = match[3];
    const fileType: 'gif' | 'png' = match[1] === 'a' ? 'gif' : 'png';
    return `https://cdn.discordapp.com/emojis/${emojiId}.${fileType}`;
  }

  /**
   * Updates the Discord embed preview element and returns a formatted value for a given giveaway requirement.
   *
   * This function sets the content of the preview element (`req_element`) based on the requirement type (e.g., message count, voice time, membership duration, server, role, custom value, or Nitro restriction).
   * It also returns a formatted string or value for further processing or display.
   *
   * @param value - The requirement string to process (e.g., 'MSG: 10', 'VOICE: 3600', 'SERVER: xyz', etc.).
   * @returns The formatted value for the requirement, or an empty string if the input is invalid or not recognized.
   */
  getGWRequirementValue(value: string | null): string {
    if (!value || value === '') { return ''; }
    const reqElement: HTMLSpanElement = document.getElementById('req_element') as HTMLSpanElement;
    const req_value: string = value.split(': ')[1];

    switch (true) {
      case value.startsWith('MSG: '):
        reqElement.innerHTML = this.markdownPipe.transform(
          this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_MSG', { count: req_value }))
        return req_value;

      case value.startsWith('VOICE: '):
        const voiceTime: string = this.convertTimePipe.transform(Number(req_value), this.translate.currentLang);
        reqElement.innerHTML = this.markdownPipe.transform(
          this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_VOICE', { voicetime: voiceTime }));
        return this.convertTimePipe.convertToFormattedTime(Number(req_value));

      case value.startsWith('MITGLIED: '):
        const memberSince: string = this.convertTimePipe.transform(Number(req_value), this.translate.currentLang);
        reqElement.innerHTML = this.markdownPipe.transform(
          this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_MEMBER', { membership: memberSince }));
        return this.convertTimePipe.convertToFormattedTime(Number(req_value));

      case value.startsWith('SERVER: '):
        const server_url: string = req_value.split(' - ')[0];
        reqElement.innerHTML = this.markdownPipe.transform(
          this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_SERVER',
            { server: server_url }));
        return server_url;

      case value.startsWith('ROLE_ID: '):
        reqElement.innerHTML = this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_ROLE');
        return req_value;

      case value.startsWith('OWN: '):
        reqElement.innerHTML = this.markdownPipe.transform(req_value)
        return req_value;

      case value === 'no_nitro':
        reqElement.innerHTML = this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_NITRO');
        return value;

      default:
        reqElement.innerHTML = '';
        return '';
    }
  }

  /**
   * Redirects the user to a simple error page with a specific error type.
   *
   * This method sets the error title and description based on the provided error type
   * and navigates the user to the `/errors/simple` page.
   *
   * @param {'LOGIN_INVALID' | 'LOGIN_EXPIRED' | 'LOGIN_BLOCKED' | 'UNKNOWN' | 'FORBIDDEN' | 'REQUESTS' | 'OFFLINE'} type - The type of error to display.
   */
  redirectLoginError(type: 'INVALID' | 'EXPIRED' | 'BLOCKED' | 'UNKNOWN' | 'FORBIDDEN' | 'REQUESTS' | 'OFFLINE' | 'NO_CLANK'): void {
    if (type === 'UNKNOWN' || type === 'OFFLINE') {
      this.error_title = `ERROR_${type}_TITLE`
      this.error_desc = `ERROR_${type}_DESC`
    } else {
      this.error_title = `ERROR_LOGIN_${type}_TITLE`
      this.error_desc = `ERROR_LOGIN_${type}_DESC`
    }

    if (type === 'NO_CLANK') {
      localStorage.removeItem('active_guild');
      this.active_guild = null;
    }

    this.router.navigateByUrl(`/errors/simple`).then();
  }

  /**
   * Handles API errors by redirecting to appropriate error pages based on the status code.
   *
   * This method checks the status code of the HTTP error response and redirects to specific
   * error pages for forbidden access (403), too many requests (429), and offline status (0).
   * If the error status code does not match any of these, it simply stops the loading state.
   *
   * @param err The HTTP error response object
   */
  handleApiError(err: HttpErrorResponse): void {
    if (err.status === 403) {
      this.redirectLoginError('FORBIDDEN');
      return;
    } else if (err.status === 401) {
      this.redirectLoginError('NO_CLANK');
    } else if (err.status === 429) {
      this.redirectLoginError('REQUESTS');
      return;
    } else if (err.status === 0) {
      this.redirectLoginError('OFFLINE');
      return;
    }

    this.isLoading = false;
  }

  /**
   * Displays an alert box with the specified title and description.
   *
   * This method sets the `error_title` and `error_desc` properties of the `DataHolderService`
   * to the provided title and description, respectively, and then sets the `showAlertBox`
   * property to `true` to display the alert box.
   *
   * @param {string} title - The title of the alert box.
   * @param {string} desc - The description of the alert box.
   */
  showAlert(title: string, desc: string): void {
    this.error_title = title;
    this.error_desc = desc;
    this.showAlertBox = true;

    setTimeout((): void => { this.showAlertBox = false; }, 5000);
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

  /**
   * Toggles the visibility of the mobile sidebar.
   */
  toggleSidebar(): void {
    this.showMobileSidebar = !this.showMobileSidebar;
  }

}
