import {AfterViewChecked, Component, OnDestroy} from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {
  DiscordMarkdownComponent
} from "../../../../structure/util/modal/templates/discord-markdown/discord-markdown.component";
import {Giveaway} from "../../../../services/types/Events";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faPanorama} from "@fortawesome/free-solid-svg-icons";
import {FormsModule} from "@angular/forms";
import {faCamera} from "@fortawesome/free-solid-svg-icons";
import {faIcons} from "@fortawesome/free-solid-svg-icons";
import {faBrush} from "@fortawesome/free-solid-svg-icons";
import {faSave} from "@fortawesome/free-solid-svg-icons";
import {faShuffle} from "@fortawesome/free-solid-svg-icons";
import {ApiService} from "../../../../services/api/api.service";
import {faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {Subscription} from "rxjs";
import {faRefresh} from "@fortawesome/free-solid-svg-icons";
import {ComService} from "../../../../services/discord-com/com.service";
import {EmojiPickerComponent} from "../../../../structure/util/modal/templates/emoji-picker/emoji-picker.component";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {Emoji} from "../../../../services/types/discord/Guilds";
import {EmbedConfig, shuffle_configs} from "../../../../services/types/Config";
import {HttpErrorResponse} from "@angular/common/http";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";

@Component({
  selector: 'app-embed-design',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    DiscordMarkdownComponent,
    FaIconComponent,
    FormsModule,
    EmojiPickerComponent,
    NgClass,
    NgOptimizedImage,
    AlertBoxComponent
  ],
  templateUrl: './embed-design.component.html',
  styleUrl: './embed-design.component.scss'
})
export class EmbedDesignComponent implements OnDestroy, AfterViewChecked {
  protected initGiveaway: Giveaway = { creator_id: '', creator_name: '', creator_avatar: '', gw_req: null, prize: '',
    channel_id: null, end_date: new Date(Date.now() + 10 * 60 * 6000), winner_count: 1, participants: 0, start_date: null };
  private readonly subscription: Subscription | null = null;
  protected disabledCacheBtn: boolean = false;
  protected disableSendBtn: boolean = false;
  protected dataLoading: boolean = true;

  protected readonly faPanorama: IconDefinition = faPanorama;
  protected readonly faCamera: IconDefinition = faCamera;
  protected readonly faIcons: IconDefinition = faIcons;
  protected readonly faBrush: IconDefinition = faBrush;
  protected readonly faSave: IconDefinition = faSave;
  protected readonly faShuffle: IconDefinition = faShuffle;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faXmark: IconDefinition = faXmark;

  constructor(protected dataService: DataHolderService, private comService: ComService, private apiService: ApiService,
              private translate: TranslateService) {
    document.title = 'Embed-Design ~ Clank Discord-Bot';
    this.dataService.isLoading = true;
    this.dataService.getEventConfig(this.apiService, this.comService); // first call to get the server data
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.dataLoading = true;
        this.dataService.getEventConfig(this.apiService, this.comService, true);
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
   * Lifecycle hook that is called after the view has been checked.
   *
   * This method ensures that the data-loading indicators are properly updated.
   * If the data is not ready yet, it sets a timeout to update
   * the loading state asynchronously, allowing the UI to display a data-loader.
   */
  ngAfterViewChecked(): void {
    if (!this.dataService.isLoading && this.dataLoading && this.dataService.embed_config) {
      setTimeout((): boolean => this.dataLoading = false, 0);
    }
  }

  /**
   * Refreshes the cache by disabling the cache button, setting the loading state,
   * and fetching the snippet data with the cache ignored. The cache button is re-enabled
   * after 15 seconds.
   */
  protected refreshCache(): void {
    this.disabledCacheBtn = true;
    this.dataService.isLoading = true;
    this.dataService.getEventConfig(this.apiService, this.comService, true);

    setTimeout((): void => { this.disabledCacheBtn = false; }, 15000);
  }

  /**
   * Saves the given embed configuration for the current guild.
   *
   * Ensures the giveaway system is enabled, sets the guild ID, and disables the send button during the save process.
   * On success, updates the local embed configuration, shows a success alert, and stores the config in localStorage.
   * On error, shows an error alert and handles rate limiting (HTTP 429) by redirecting to login.
   *
   * @param embed_config The embed configuration to save.
   */
  protected saveGiftConfig(embed_config: EmbedConfig): void {
    if (!this.dataService.active_guild) { return; }
    if ((embed_config.thumbnail_invalid && embed_config.thumbnail_url) || (embed_config.banner_invalid && embed_config.banner_url)) {
      this.dataService.error_color = 'red';
      this.dataService.showAlert(this.translate.instant('ERROR_GIVEAWAY_EMBED_INVALID_IMAGE_TITLE'),
        this.translate.instant('ERROR_GIVEAWAY_EMBED_INVALID_IMAGE_DESC'));

      this.disableSendBtn = true;
      setTimeout((): void => { this.disableSendBtn = false; }, 3000);
      return;
    }

    const { thumbnail_invalid, banner_invalid, ...send_config }: EmbedConfig = { ...embed_config };
    send_config.guild_id = this.dataService.active_guild.id;
    send_config.enabled = true; // always enable the giveaway system when saving the config
    if (send_config.color_code) {
      send_config.color_code = parseInt(send_config.color_code.toString().replace('#', ''), 16);
    }

    this.disableSendBtn = true;
    const saved_config: Subscription = this.apiService.saveEmbedConfig(send_config)
      .subscribe({
        next: (changed_config: EmbedConfig): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_GIVEAWAY_EMBED_SAVED_TITLE'),
            this.translate.instant('SUCCESS_GIVEAWAY_EMBED_SAVED_DESC', { name: this.dataService.active_guild?.name}));

          // update shown data
          if (typeof changed_config.color_code === 'number') {
            changed_config.color_code = `#${changed_config.color_code.toString(16).padStart(6, '0')}`;
          }
          this.dataService.embed_config = changed_config;
          setTimeout(() => { this.disableSendBtn = false; }, 3000);
          localStorage.setItem('gift_config', JSON.stringify(this.dataService.embed_config));
          saved_config.unsubscribe();
        },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';
          saved_config.unsubscribe();

          if (error.status == 404 || error.status == 400) {
            this.dataService.showAlert(this.translate.instant('ERROR_GIVEAWAY_EMBED_INVALID_EMOJI_TITLE'),
              this.translate.instant('ERROR_GIVEAWAY_EMBED_INVALID_EMOJI_DESC'));
          } else if (error.status === 402) {
            this.dataService.showAlert(this.translate.instant('ERROR_TITLE_402'),
              this.translate.instant('ERROR_GIVEAWAY_DESIGN_402_DESC'));
          } else if (error.status == 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else {
            this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
          }

          this.disableSendBtn = false;
        }
      });
  }

  /**
   * Validates and normalizes the embed color input.
   * Only allows alphanumeric characters and a leading '#'.
   *
   * @param event InputEvent from the input field
   */
  verifyEmbedColor(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value: string = input.value;

    // Only allow alphanumeric and leading '#'
    value = value.replace(/[^a-zA-Z0-9#]/g, '');

    // Ensure value starts with '#'
    value = '#' + value.replace(/^#+/, '');

    input.value = value;
  }

  /**
   * Validates the embed image URL by attempting to load it.
   * Sets the `thumbnail_invalid` flag in the embed configuration
   * based on whether the image loads successfully or not.
   *
   * @param event - InputEvent from the image URL input field
   * @param banner - Optional parameter to indicate if the image is for a banner
   */
  verifyEmbedImage(event: Event, banner?: boolean): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    const url: string = input.value.trim();
    if (url.length === 0) {
      if (!banner) { this.dataService.embed_config.thumbnail_url = null;
      } else { this.dataService.embed_config.banner_url = null; }
      return;
    }

    // Only allow http(s) URLs and basic image extensions
    const isValidUrl: boolean = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url.split('?')[0]);
    if (!isValidUrl) {
      if (!banner) { this.dataService.embed_config.thumbnail_invalid = true; } else { this.dataService.embed_config.banner_invalid = true; }
      return;
    }

    const img: HTMLImageElement = new Image();
    img.onload = (): void => {
      if (!banner) { this.dataService.embed_config.thumbnail_invalid = false;
      } else { this.dataService.embed_config.banner_invalid = false; }
    };
    img.onerror = (): void => {
      if (!banner) { this.dataService.embed_config.thumbnail_invalid = true;
      } else { this.dataService.embed_config.banner_invalid = true; }
    };
    img.src = url;
  }

  /**
   * Sets the emoji reaction for the embed configuration.
   * Accepts either a string (custom or unicode emoji) or an Emoji object.
   * If an Emoji object is provided, it formats the emoji as a Discord custom emoji string.
   *
   * @param emoji - The emoji to set as a reaction, either as a string or Emoji object.
   */
  verifyEmbedEmoji(emoji: Emoji | string): void {
    if (typeof emoji === 'string') {
      this.dataService.embed_config.emoji_reaction = emoji;
    } else {
      const prefix: '<a:' | '<:' = emoji.animated ? '<a:' : '<:';
      this.dataService.embed_config.emoji_reaction = `${prefix}${emoji.name}:${emoji.id}>`;
    }
  }

  /**
   * Shuffles the configuration list, randomly selects one configuration,
   * and assigns a random hex color code to the selected configuration.
   */
  shuffleConfigs(): void {
    const shuffled: EmbedConfig[] = [...shuffle_configs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }  // Create a copy and shuffle the array

    // Select the first configuration from the shuffled array
    this.dataService.embed_config = shuffled[0];
    this.dataService.embed_config.color_code = '#' +
      Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

    // Set a random emoji from guild emojis if available
    if (this.dataService.guild_emojis && this.dataService.guild_emojis.length >= 20) {
      if (Math.random() < 0.1) { // 10% chance to not set an emoji
        this.dataService.embed_config.emoji_reaction = null;
      } else {
        const randomIndex: number = Math.floor(Math.random() * this.dataService.guild_emojis.length);
        const randomEmoji: Emoji = this.dataService.guild_emojis[randomIndex] as Emoji;
        this.verifyEmbedEmoji(randomEmoji);
      }
    }
  }

  /**
   * Checks if the current embed configuration has been changed compared to the original configuration.
   * Ignores the `banner_invalid` and `thumbnail_invalid` flags during comparison.
   *
   * @returns `true` if the configuration has changed, otherwise `false`.
   */
  isConfigChanged(): boolean {
    if (!this.dataService.embed_config) { return false; }

    // Remove banner_invalid und thumbnail_invalid flags from comparison
    const { banner_invalid, thumbnail_invalid, ...embedConfigClean } = this.dataService.embed_config;
    const { banner_invalid: orgBannerInvalid, thumbnail_invalid: orgThumbnailInvalid, ...orgConfigClean } = this.dataService.org_config ?? {};
    return JSON.stringify(embedConfigClean) !== JSON.stringify(orgConfigClean);
  }
}
