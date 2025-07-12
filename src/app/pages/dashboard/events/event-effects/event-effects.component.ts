import {Component, OnDestroy} from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {SelectComponent} from "../../../../structure/util/modal/templates/select/select.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faHashtag, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faSave} from "@fortawesome/free-solid-svg-icons/faSave";
import {event_cards, EventCard, EventEffects, EventEffectsRaw} from "../../../../services/types/Events";
import {Channel, Role} from "../../../../services/types/discord/Guilds";
import {NgClass} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {ApiService} from "../../../../services/api/api.service";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {faVolumeHigh} from "@fortawesome/free-solid-svg-icons/faVolumeHigh";

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
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
      ]),
    ]),
  ]
})
export class EventEffectsComponent implements OnDestroy {
  protected readonly faVolumeHigh: IconDefinition = faVolumeHigh;
  protected readonly faHashtag: IconDefinition = faHashtag;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faXmark: IconDefinition = faXmark;
  protected readonly faSave: IconDefinition = faSave;
  protected activeTab: 'ROLES' | 'CHANNELS' = 'ROLES';

  protected event_cards: EventCard[] = event_cards;
  private org_event_cards: EventCard[] = [...event_cards]; // Store original event cards for change detection
  private readonly subscription: Subscription | null = null;
  protected disabledCacheBtn: boolean = false;

  constructor(private apiService: ApiService, protected dataService: DataHolderService, private translate: TranslateService) {
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
   * Adds a role or channel to the given event card's object list based on the current active tab.
   *
   * @param obj_id - The ID of the role or channel to add.
   * @param card - The event card to which the object should be added.
   * @param remove - Optional parameter to indicate whether to remove the object instead of adding it.
   */
  pushToCardList(obj_id: string, card: EventCard, remove?: boolean): void {
    let obj: Role | Channel | undefined;
    if (this.activeTab === 'ROLES') {
      const role: Role | undefined = this.dataService.guild_roles.find(r => r.id === obj_id);
      obj = role;
      if (role) {
        if (remove) {  // Remove the role from the card's object list
          card.obj_list = (card.obj_list as Role[]).filter(r => r.id !== role.id);
        } else {
          (card.obj_list as Role[]).push(role);
          (card.obj_list as Role[]).sort((a, b) => b.position - a.position);
        }
      }
    } else {
      const channel: Channel | undefined = this.dataService.guild_channels.find(c => c.id === obj_id);
      obj = channel;
      if (channel) {
        if (remove) {  // Remove the channel from the card's object list
          card.obj_list = (card.obj_list as Channel[]).filter(c => c.id !== channel.id);
        } else {
          if (card.title === 'EVENTS_TAB_INVITE_TITLE') {  // Invite log category, only one channel allowed
            card.obj_list = [channel];
          } else {
            (card.obj_list as Channel[]).push(channel);
            (card.obj_list as Channel[]).sort((a, b) => b.position - a.position);
          }
        }
      }
    }

    this.dataService.error_color = 'green';
    this.dataService.showAlert(this.translate.instant(`SUCCESS_EFFECTS_${this.activeTab}_${remove ? 'DELETE_' : ''}TITLE`),
      this.translate.instant(`SUCCESS_EFFECTS_${this.activeTab}_${remove ? 'DELETE_' : ''}DESC`,
        { name: obj?.name, type: this.translate.instant(card.title).split(' ~ ')[1] }));
  }

  /**
   * Returns a filtered list of roles or channels that are not already included in the given event card's object list.
   *
   * @param card - The event card to check against.
   * @returns An array of roles or channels not present in the card's object list.
   */
  excludeFromSelect(card: EventCard): Role[] | Channel[] {
    if (this.activeTab === 'ROLES') {
      return this.dataService.guild_roles.filter(role =>
        !(card.obj_list as Role[]).some(selectedRole => selectedRole.id === role.id)
      );
    } else {
      return this.dataService.guild_channels.filter(channel => {
        if (card.title === 'EVENTS_TAB_INVITE_TITLE' && !this.dataService.isTextChannel(channel)) {
          return false;  // Invite log category only allows text channels
        }
        return !(card.obj_list as Channel[]).some(selectedChannel => selectedChannel.id === channel.id);
      });
    }
  }

  /**
   * Maps the categories of channel and role effects to their corresponding event cards.
   * Optimizes the mapping by using a Map for faster lookups of roles and channels.
   *
   * @param effects - the EventEffects object containing role and channel effects.
   */
  protected mapEffectsToEventCards(effects: EventEffects): void {
    this.event_cards.forEach(card => card.obj_list = []);  // Reset the obj_list for each card

    const roleMap = new Map<string, Role>();
    const channelMap = new Map<string, Channel>();

    this.dataService.guild_roles.forEach(role => roleMap.set(role.id, role));
    this.dataService.guild_channels.forEach(channel => channelMap.set(channel.id, channel));

    effects.role_effects.forEach(effect => {
      const role = roleMap.get(effect.role_id);
      if (role && effect.category < this.event_cards.length) {
        const card = this.event_cards[effect.category];
        (card.obj_list as Role[]).push(role);
      }
    });

    // Blacklisted -> eventCards[6] | Invite log -> eventCards[7]
    const channelCategoryMapping = { 0: 6, 6: 7 };
    effects.channel_effects.forEach(effect => {
      const targetIndex = channelCategoryMapping[effect.category as keyof typeof channelCategoryMapping];
      if (targetIndex !== undefined && targetIndex < this.event_cards.length) {
        const channel = channelMap.get(effect.channel_id);
        if (channel) {
          (this.event_cards[targetIndex].obj_list as Channel[]).push(channel);
        }
      }
    });

    this.org_event_cards = JSON.parse(JSON.stringify(this.event_cards));
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
