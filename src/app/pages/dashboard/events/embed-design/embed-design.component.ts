import {Component, OnDestroy} from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {
  DiscordMarkdownComponent
} from "../../../../structure/util/modal/templates/discord-markdown/discord-markdown.component";
import {Giveaway} from "../../../../services/types/Events";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faPanorama} from "@fortawesome/free-solid-svg-icons/faPanorama";
import {FormsModule} from "@angular/forms";
import {faCamera} from "@fortawesome/free-solid-svg-icons/faCamera";
import {faIcons} from "@fortawesome/free-solid-svg-icons/faIcons";
import {faBrush} from "@fortawesome/free-solid-svg-icons/faBrush";
import {faSave} from "@fortawesome/free-solid-svg-icons/faSave";
import {faShuffle} from "@fortawesome/free-solid-svg-icons/faShuffle";
import {ApiService} from "../../../../services/api/api.service";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {Subscription} from "rxjs";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";

@Component({
  selector: 'app-embed-design',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    DiscordMarkdownComponent,
    FaIconComponent,
    FormsModule
  ],
  templateUrl: './embed-design.component.html',
  styleUrl: './embed-design.component.scss'
})
export class EmbedDesignComponent implements OnDestroy {
  protected initGiveaway: Giveaway = { creator_id: '', creator_name: '', creator_avatar: '', gw_req: null, prize: '',
    channel_id: null, end_date: new Date(Date.now() + 10 * 60 * 6000), winner_count: 1, participants: 0, start_date: null };
  private readonly subscription: Subscription | null = null;
  protected disabledCacheBtn: boolean = false;

  protected readonly faPanorama: IconDefinition = faPanorama;
  protected readonly faCamera: IconDefinition = faCamera;
  protected readonly faIcons: IconDefinition = faIcons;
  protected readonly faBrush: IconDefinition = faBrush;
  protected readonly faSave: IconDefinition = faSave;
  protected readonly faShuffle: IconDefinition = faShuffle;
  protected readonly faRefresh: IconDefinition = faRefresh;

  constructor(protected dataService: DataHolderService, private apiService: ApiService) {
    this.dataService.isLoading = true;
    this.dataService.getEventConfig(this.apiService); // first call to get the server data
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.dataService.getEventConfig(this.apiService, true);
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
   * Refreshes the cache by disabling the cache button, setting the loading state,
   * and fetching the snippet data with the cache ignored. The cache button is re-enabled
   * after 15 seconds.
   */
  protected refreshCache(): void {
    this.disabledCacheBtn = true;
    this.dataService.isLoading = true;
    this.dataService.getEventConfig(this.apiService, true);

    setTimeout((): void => { this.disabledCacheBtn = false; }, 15000);
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
    if (!value.startsWith('#')) {
      value = '#' + value.replace(/^#+/, '');
    }

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
    const input = event.target as HTMLInputElement;
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

    const img = new Image();
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
}
