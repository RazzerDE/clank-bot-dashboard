import {Component, OnDestroy} from '@angular/core';
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {SelectComponent} from "../../../../structure/util/modal/templates/select/select.component";
import {faHashtag, faImage, faTrash, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {faSave} from "@fortawesome/free-solid-svg-icons/faSave";
import {faLock} from "@fortawesome/free-solid-svg-icons/faLock";
import {faCircleQuestion} from "@fortawesome/free-regular-svg-icons";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {faUser} from "@fortawesome/free-solid-svg-icons/faUser";
import {
  DiscordMarkdownComponent
} from "../../../../structure/util/modal/templates/discord-markdown/discord-markdown.component";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "../../../../services/api/api.service";
import {ComService} from "../../../../services/discord-com/com.service";
import {
  GlobalChatConfig,
  GlobalChatConfigDetails,
  GlobalChatCustomizing,
  GlobalChatObject
} from "../../../../services/types/Misc";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {faUnlock} from "@fortawesome/free-solid-svg-icons/faUnlock";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-global-chat',
  imports: [
    AlertBoxComponent,
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent,
    SelectComponent,
    NgbTooltip,
    DiscordMarkdownComponent,
    NgClass,
    FormsModule,
    NgOptimizedImage
  ],
  templateUrl: './global-chat.component.html',
  styleUrl: './global-chat.component.scss'
})
export class GlobalChatComponent implements OnDestroy {
  protected readonly faCircleQuestion: IconDefinition = faCircleQuestion;
  protected readonly faUnlock: IconDefinition = faUnlock;
  protected readonly faHashtag: IconDefinition = faHashtag;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly Number: NumberConstructor = Number;
  protected readonly faTrash: IconDefinition = faTrash;
  protected readonly faImage: IconDefinition = faImage;
  protected readonly faUser: IconDefinition = faUser;
  protected readonly faSave: IconDefinition = faSave;
  protected readonly faLock: IconDefinition = faLock;
  private readonly subscription: Subscription | null = null;
  protected isInvalidAvatar: boolean = false;
  protected disabledSendBtn: boolean = false;
  protected disabledLockBtn: boolean = false;
  protected disableUpdateBtn: boolean = false;

  private details: GlobalChatConfigDetails = { channel_id: null, message_count: 0, created_at: Date.now(), lock_reason: null,
                                               bot_name: null, bot_avatar_url: null, invite: null };
  protected global_chat: GlobalChatConfig = { global_config: this.details, channel_count: 0, total_message_count: 0, global_desc: null };
  protected org_global_chat: GlobalChatConfig = JSON.parse(JSON.stringify(this.global_chat)); // deep copy of the global chat config

  constructor(protected dataService: DataHolderService, private apiService: ApiService, private comService: ComService,
              protected translate: TranslateService) {
    document.title = 'Global Chat - Clank Discord-Bot';
    this.dataService.isLoading = true;
    this.getGlobalChat(true);
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.isInvalidAvatar = false;
        this.global_chat = { global_config: this.details, channel_count: 0, total_message_count: 0, global_desc: null };
        this.getGlobalChat(true);
      }
    });
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   *
   * This method unsubscribes from all active subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  /**
   * Updates or creates the global chat configuration with the specified channel ID.
   *
   * If a global configuration already exists, its channel ID is updated.
   * Otherwise, a new configuration object is created with default values.
   *
   * @param channel_id - The ID of the channel to be set for the global chat.
   */
  protected saveGlobalChat(channel_id: string): void {
    if (this.global_chat.global_config) { this.global_chat.global_config.channel_id = channel_id;
    } else {
      this.global_chat.global_config = { channel_id: channel_id, message_count: 0, created_at: Date.now(),
                                         lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
    }
  }

  /**
   * Checks if there are unsaved changes between the original and current global-chat configuration.
   * @returns `true` if changes exist, otherwise `false`.
   */
  protected hasChatChanges(): boolean {
    return JSON.stringify(this.org_global_chat.global_config?.channel_id) !== JSON.stringify(this.global_chat.global_config?.channel_id);
  }

  /**
   * Checks if there are unsaved customization changes in the global chat configuration.
   *
   * @returns {boolean} Whether customization fields have been modified.
   */
  protected hasCustomizeChanges(): boolean {
    return JSON.stringify(this.org_global_chat.global_config?.bot_name) !== JSON.stringify(this.global_chat.global_config?.bot_name) ||
           JSON.stringify(this.org_global_chat.global_config?.bot_avatar_url) !== JSON.stringify(this.global_chat.global_config?.bot_avatar_url) ||
           JSON.stringify(this.org_global_chat.global_desc) !== JSON.stringify(this.global_chat.global_desc);
  }

  /**
   * Refreshes the cache by disabling the cache button, setting the loading state,
   * and fetching the snippet data with the cache ignored. The cache button is re-enabled
   * after 15 seconds.
   */
  protected refreshCache(element: HTMLButtonElement): void {
    element.disabled = true;
    this.dataService.isLoading = true;
    this.getGlobalChat(true);

    setTimeout((): void => { element.disabled = false; }, 15000);
  }

  /**
   * Validates the provided avatar URL from an input event.
   *
   * - Checks if the input is a non-empty string.
   * - Ensures the URL uses http(s) and ends with a valid image extension.
   * - Attempts to load the image to verify accessibility.
   * - Sets `isInvalidAvatar` to true if the URL is invalid or the image cannot be loaded.
   *
   * @param event - The input event containing the avatar URL.
   */
  protected verifyAvatarURL(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    const url: string = input.value.trim();
    if (url.length === 0) { this.global_chat.global_config!.bot_avatar_url = null; this.isInvalidAvatar = true; return; }

    // Only allow http(s) URLs and basic image extensions
    const isValidUrl: boolean = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url.split('?')[0]);
    if (!isValidUrl) {
      this.global_chat.global_config!.bot_avatar_url = null;
      this.isInvalidAvatar = true;
      return;
    }

    const img: HTMLImageElement = new Image();
    img.onload = (): void => { this.global_chat.global_config!.bot_avatar_url = url; this.isInvalidAvatar = false; };
    img.onerror = (): void => { this.global_chat.global_config!.bot_avatar_url = null; this.isInvalidAvatar = true; };
    img.src = url;
  }

  /**
   * Saves the customizing options for the global chat configuration.
   *
   * @param lock Optional. If true, the global chat lock action will be changed
   */
  protected saveCustomizing(lock?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    if (!this.global_chat.global_config?.bot_avatar_url || this.isInvalidAvatar) {
      this.dataService.error_color = 'red';
      this.dataService.showAlert(this.translate.instant("ERROR_MISC_GLOBAL_INVALID_AVATAR_TITLE"),
        this.translate.instant("ERROR_MISC_GLOBAL_INVALID_AVATAR_DESC"));
      return;
    }

    if (lock) { this.global_chat.global_config!.lock_reason = this.global_chat.global_config!.lock_reason ? null : '/'; }
    const customizing: GlobalChatCustomizing = {
      bot_name: this.global_chat.global_config!.bot_name, bot_avatar: this.global_chat.global_config!.bot_avatar_url,
      lock_reason: this.global_chat.global_config!.lock_reason, description: this.global_chat.global_desc
    }

    lock ? this.disabledLockBtn = true : this.disabledSendBtn = true;
    const sub: Subscription = this.apiService.saveGlobalChatCustomizing(this.dataService.active_guild.id, customizing)
      .subscribe({
        next: (_: Object): void => {
          sub.unsubscribe();
          this.org_global_chat = JSON.parse(JSON.stringify(this.global_chat));
          localStorage.setItem('misc_globalchat', JSON.stringify(this.global_chat));
          this.dataService.error_color = 'green';

          if (lock) {
            if (customizing.lock_reason) {
              this.dataService.showAlert(this.translate.instant("SUCCESS_MISC_GLOBAL_LOCK_TITLE"),
                this.translate.instant("SUCCESS_MISC_GLOBAL_LOCK_DESC"));
            } else {
              this.dataService.showAlert(this.translate.instant("SUCCESS_MISC_GLOBAL_UNLOCK_TITLE"),
                this.translate.instant("SUCCESS_MISC_GLOBAL_LOCK_DESC"));
            }

            setTimeout((): void => { lock ? this.disabledLockBtn = false : this.disabledSendBtn = false; }, 5000);
          } else {
            this.dataService.showAlert(this.translate.instant("SUCCESS_MISC_GLOBAL_CUSTOMIZE_TITLE"),
              this.translate.instant("SUCCESS_MISC_GLOBAL_CUSTOMIZE_DESC"));
          }

        },
        error: (err: HttpErrorResponse): void => {

          if (err.status === 404) {
            this.dataService.error_color = 'red';
            this.dataService.showAlert(this.translate.instant("ERROR_MISC_GLOBAL_MISSING_TITLE"),
              this.translate.instant("ERROR_MISC_GLOBAL_MISSING_DESC"));
          } else if (err.status === 409) {
            this.dataService.error_color = 'red';
            this.dataService.showAlert(this.translate.instant("ERROR_MISC_GLOBAL_INVALID_AVATAR_TITLE"),
              this.translate.instant("ERROR_MISC_GLOBAL_INVALID_AVATAR_DESC"));
          } else if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else if (err.status === 0) {
            this.dataService.redirectLoginError('OFFLINE');
            return;
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }

          setTimeout((): void => { lock ? this.disabledLockBtn = false : this.disabledSendBtn = false; }, 2000);
          sub.unsubscribe();
        }
      });
  }

  /**
   * Updates the global chat configuration for the active guild.
   *
   * Sends an update request to the backend API to either set or delete the global chat channel,
   * depending on the `is_delete` flag. Handles success and error responses, updates local state,
   * and provides user feedback via alerts.
   *
   * @param is_delete Optional. If true, deletes the global chat channel; otherwise, sets it.
   */
  protected updateGlobalChat(is_delete?: boolean): void  {
    if (!this.dataService.active_guild || !this.global_chat.global_config?.channel_id) { return; }

    const updated: GlobalChatObject = { guild_id: this.dataService.active_guild.id, is_delete: !!is_delete,
                                        object_id: this.global_chat.global_config?.channel_id }

    this.disableUpdateBtn = true;
    const sub: Subscription = this.apiService.updateGlobalChat(this.dataService.active_guild.id, updated)
      .subscribe({
        next: (_: Object): void => {
          sub.unsubscribe();

          this.global_chat.global_chat_pending_id = this.global_chat.global_config!.channel_id;
          this.global_chat.global_chat_pending_delete = is_delete;

          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant(`SUCCESS_MISC_GLOBAL_${is_delete ? 'DELETE' : 'SET'}_TITLE`),
            this.translate.instant(`SUCCESS_MISC_GLOBAL_${is_delete ? 'DELETE' : 'SET'}_DESC`));

          this.org_global_chat = JSON.parse(JSON.stringify(this.global_chat));
          localStorage.setItem('misc_globalchat', JSON.stringify(this.global_chat));
          this.disableUpdateBtn = false;
        },
        error: (err: HttpErrorResponse): void => {
          if (err.status === 404) {  // channel doesnt exist, no reason to delete it
            this.dataService.error_color = 'red';
            this.dataService.showAlert(this.translate.instant("ERROR_MISC_GLOBAL_MISSING_TITLE"),
              this.translate.instant("ERROR_MISC_GLOBAL_MISSING_DESC"));
          } else if (err.status === 409) { // same channel already set as global chat
            this.dataService.error_color = 'red';
            this.dataService.showAlert(this.translate.instant("ERROR_MISC_GLOBAL_ALREADY_SET_TITLE"),
              this.translate.instant("ERROR_MISC_GLOBAL_ALREADY_SET_DESC"));
          } else if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else if (err.status === 0) {
            this.dataService.redirectLoginError('OFFLINE');
            return;
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }

          this.disableUpdateBtn = false;
          sub.unsubscribe();
        }
      });
  }

  /**
   * Retrieves the global chat configuration for the currently active guild.
   *
   * @param no_cache Optional. If true, ignores the cache and fetches fresh data from the API.
   */
  protected getGlobalChat(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    this.dataService.isLoading = true;

    // check if guilds are already stored in local storage (30 seconds cache)
    if ((localStorage.getItem('misc_globalchat') && localStorage.getItem('misc_globalchat_timestamp') &&
      Date.now() - Number(localStorage.getItem('misc_globalchat_timestamp')) < 30000 && !no_cache)) {
      this.global_chat = JSON.parse(localStorage.getItem('misc_globalchat') as string);
      if (!this.global_chat.global_config) {  // initialize global_config if it doesn't exist
        this.global_chat.global_config = { channel_id: null, message_count: 0, created_at: Date.now(),
          lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
      }

      this.org_global_chat = JSON.parse(JSON.stringify(this.global_chat));
      setTimeout((): void => {this.dataService.getGuildChannels(this.comService, no_cache, true, 'TEXT')}, 100);
      return;
    }

    const sub: Subscription = this.apiService.getGuildGlobalChat(this.dataService.active_guild!.id)
      .subscribe({
        next: (config: GlobalChatConfig): void => {
          if (!config.global_config) {  // initialize global_config if it doesn't exist
            config.global_config = { channel_id: null, message_count: 0, created_at: Date.now(),
              lock_reason: null, bot_name: null, bot_avatar_url: null, invite: null };
          }

          if (config.global_chat_pending_id) { config.global_config.channel_id = config.global_chat_pending_id; }

          this.global_chat = config;
          this.org_global_chat = JSON.parse(JSON.stringify(this.global_chat));

          setTimeout((): void => {this.dataService.getGuildChannels(this.comService, no_cache, true, 'TEXT')}, 550);
          localStorage.setItem('misc_globalchat', JSON.stringify(this.global_chat));
          localStorage.setItem('misc_globalchat_timestamp', Date.now().toString());
          sub.unsubscribe();
        },
        error: (err: HttpErrorResponse): void => {
          this.dataService.isLoading = false;

          if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else if (err.status === 0) {
            this.dataService.redirectLoginError('OFFLINE');
            return;
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }
          sub.unsubscribe();
        }
      });
  }
}
