import {Component, OnDestroy} from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {SelectComponent} from "../../../../structure/util/modal/templates/select/select.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faHashtag, faTrashAlt, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faSave} from "@fortawesome/free-solid-svg-icons/faSave";
import {event_cards, EventCard, EventEffects, EventEffectsRaw} from "../../../../services/types/Events";
import {Channel, Role} from "../../../../services/types/discord/Guilds";
import {NgClass} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {ApiService} from "../../../../services/api/api.service";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-event-effects',
  imports: [
    AlertBoxComponent,
    DashboardLayoutComponent,
    PageThumbComponent,
    ReactiveFormsModule,
    TranslatePipe,
    SelectComponent,
    FaIconComponent,
    NgClass,
  ],
  templateUrl: './event-effects.component.html',
  styleUrl: './event-effects.component.scss',
  animations: [
    trigger('zoomAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1 }),
        animate('200ms ease-in', style({ transform: 'scale(0)', opacity: 0 }))
      ])
    ])
  ]
})
export class EventEffectsComponent implements OnDestroy {
  protected readonly faTrashAlt: IconDefinition = faTrashAlt;
  protected readonly faHashtag: IconDefinition = faHashtag;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faSave: IconDefinition = faSave;
  protected activeTab: 'ROLES' | 'CHANNELS' = 'ROLES';

  protected event_cards: EventCard[] = event_cards;
  private org_event_cards: EventCard[] = [...event_cards]; // Store original event cards for change detection
  private readonly subscription: Subscription | null = null;
  protected disabledCacheBtn: boolean = false;

  constructor(private apiService: ApiService, protected dataService: DataHolderService) {
    this.dataService.isLoading = true;
    this.getEventEffects(true); // first call to get the server data
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.getEventEffects(true);
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
    this.getEventEffects(true);

    setTimeout((): void => { this.disabledCacheBtn = false; }, 15000);
  }

  /**
   * Fetches event effects (channel and role effects) for the active guild.
   *
   * @param {boolean} [no_cache] - If true, ignores the cache and fetches fresh data from the API.
   * @returns {void}
   */
  getEventEffects(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    this.dataService.isLoading = true;

    // check if guilds are already stored in local storage (60 seconds cache)
    if ((localStorage.getItem('gift_effects') && localStorage.getItem('guild_channels') &&
      localStorage.getItem('guild_roles') && localStorage.getItem('gift_effects_timestamp') &&
      Date.now() - Number(localStorage.getItem('gift_effects_timestamp')) < 60000 && !no_cache)) {
      const effects: EventEffects = JSON.parse(localStorage.getItem('gift_effects') as string);
      this.dataService.guild_channels = JSON.parse(localStorage.getItem('guild_channels') as string);
      this.dataService.guild_roles = JSON.parse(localStorage.getItem('guild_roles') as string);
      this.mapEffectsToEventCards(effects);

      this.dataService.isLoading = false;
      return;
    }

    const sub: Subscription = this.apiService.getEventEffects(this.dataService.active_guild.id)
      .subscribe({
        next: (effects_raw: EventEffectsRaw): void => {
          const effects: EventEffects = { channel_effects: effects_raw.channel_effects, role_effects: effects_raw.role_effects };

          this.dataService.guild_channels = effects_raw.guild_channels;
          this.dataService.guild_roles = effects_raw.guild_roles;
          this.mapEffectsToEventCards(effects);

          this.dataService.isLoading = false;
          localStorage.setItem('gift_effects', JSON.stringify(effects));
          localStorage.setItem('guild_channels', JSON.stringify(this.dataService.guild_channels));
          localStorage.setItem('guild_roles', JSON.stringify(this.dataService.guild_roles));
          localStorage.setItem('gift_effects_timestamp', Date.now().toString());
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

  /**
   * Maps the categories of channel and role effects to their corresponding event cards.
   * The mapping is based on the category index, which matches the order of event_cards.
   *
   * @param effects - The event effects containing channel and role effects.
   */
  protected mapEffectsToEventCards(effects: EventEffects): void {
    this.event_cards.forEach(card => card.obj_list = []);  // Reset obj_list for each card

    // Map role effects to event cards by category
    effects.role_effects.forEach(effect => {
      const card: EventCard = this.event_cards[effect.category];
      const role: Role | undefined = this.dataService.guild_roles.find(r => r.id === effect.role_id);
      if (role) {
        (card.obj_list as Role[]).push(role);
      }
    });

    // Map channel effects to event cards by category
    effects.channel_effects.forEach(effect => {
      // Channel categories: 0 (Blacklisted) maps to eventCards[6], 6 (invite log) maps to eventCards[7] if exists
      const cardIdx: 0 | 6 | undefined = effect.category === 0 ? 0 : (effect.category === 6 && this.event_cards.length > 6 ? 6 : undefined);
      if (cardIdx !== undefined) {
        const card: EventCard = this.event_cards[cardIdx === 0 ? 6 : 7];
        const channel: Channel | undefined = this.dataService.guild_channels.find(c => c.id === effect.channel_id);
        if (channel) {
          (card.obj_list as Channel[]).push(channel);
        }
      }
    });

    this.org_event_cards = [...this.event_cards]; // Update original event cards for change detection
  }

  /**
   * Type guard to check if a value is of type `Role`.
   *
   * @param value - The value to check, which can be a SelectItems or a `Role` object.
   * @returns `true` if the value is a `Role` object, otherwise `false`.
   */
  protected isRoleType(value: Role | Channel): value is Role {
    return value !== null && 'hoist' in value && 'color' in value;
  }

  /**
   * Checks if the current event card list has changed compared to the original configuration.
   *
   * @returns `true` if the configuration has changed, otherwise `false`.
   */
  isCardListChanged(): boolean {
    return JSON.stringify(this.event_cards) !== JSON.stringify(this.org_event_cards);
  }
}
