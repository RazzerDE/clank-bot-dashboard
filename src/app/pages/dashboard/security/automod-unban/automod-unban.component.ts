import {Component, OnDestroy, ViewChild} from '@angular/core';
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgClass} from "@angular/common";
import {
  faHashtag,
  faShieldHalved,
  faTrash,
  faXmark,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import {UnbanMethod} from "../../../../services/types/Security";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {SelectComponent} from "../../../../structure/util/modal/templates/select/select.component";
import {EventCard} from "../../../../services/types/Events";
import {faHandcuffs} from "@fortawesome/free-solid-svg-icons/faHandcuffs";
import {Subscription} from "rxjs";
import {ApiService} from "../../../../services/api/api.service";
import {HttpErrorResponse} from "@angular/common/http";
import {SelectItems} from "../../../../services/types/Config";
import {FormsModule} from "@angular/forms";
import {animate, style, transition, trigger} from "@angular/animations";
import {ModalComponent} from "../../../../structure/util/modal/modal.component";

@Component({
  selector: 'app-automod-unban',
  imports: [
    AlertBoxComponent,
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent,
    NgClass,
    SelectComponent,
    FormsModule,
    ModalComponent,
  ],
  templateUrl: './automod-unban.component.html',
  styleUrl: './automod-unban.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class AutomodUnbanComponent implements OnDestroy {
  protected readonly faHashtag: IconDefinition = faHashtag;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faShieldHalved: IconDefinition = faShieldHalved;
  protected readonly faXmark: IconDefinition = faXmark;
  protected readonly faTrash: IconDefinition = faTrash;
  protected readonly faHandcuffs: IconDefinition = faHandcuffs;
  private readonly subscription: Subscription | null = null;
  protected disabledCacheBtn: boolean = false;
  protected disabledSaveBtn: boolean = false;

  protected event_cards: EventCard[] = [
    {title: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_0_TITLE', color: 'red',
      description: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_0_DESC'},
    {title: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_1_TITLE', color: 'blue',
      description: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_1_DESC'},
    {title: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_2_TITLE', color: 'rosa',
      description: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_2_DESC'},
    {title: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_3_TITLE', color: 'yellow',
      description: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_3_DESC'},
    {title: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_4_TITLE', color: 'green',
      description: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_4_DESC'}] as EventCard[];
  protected unban_method: UnbanMethod = { method_extra: null, method_type: null };
  protected org_features: UnbanMethod = JSON.parse(JSON.stringify(this.unban_method));
  protected methods_select: SelectItems[] = this.getUnbanMethods();
  protected modalElement: HTMLButtonElement | null = null;
  @ViewChild(ModalComponent) protected modal!: ModalComponent;

  constructor(protected dataService: DataHolderService, private apiService: ApiService, private translate: TranslateService) {
    document.title = 'AutoMod-Settings - Clank Discord-Bot';
    this.dataService.isLoading = false;
    this.getUnbanMethod();
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.getUnbanMethod(true);
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
   * Fetches the current unban method configuration for the active guild.
   *
   * Uses a 15-second cache stored in localStorage to minimize API calls.
   * If `no_cache` is true or the cache is expired, fetches fresh data from the API.
   * Updates `unban_method` and `org_features` with the received configuration.
   * Handles loading state and redirects on API errors.
   *
   * @param no_cache Optional flag to bypass the cache and force an API request.
   */
  protected getUnbanMethod(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    this.dataService.isLoading = true;

    // check if guilds are already stored in local storage (15 seconds cache)
    if ((localStorage.getItem('unban_method') && localStorage.getItem('unban_method_timestamp') &&
      Date.now() - Number(localStorage.getItem('unban_method_timestamp')) < 15000 && !no_cache)) {
      this.unban_method = JSON.parse(localStorage.getItem('unban_method') as string);
      this.org_features = JSON.parse(JSON.stringify(this.unban_method));

      this.dataService.isLoading = false;
      return;
    }

    const sub: Subscription = this.apiService.getUnbanMethod(this.dataService.active_guild.id)
      .subscribe({
        next: (config: UnbanMethod): void => {
          this.unban_method = config;
          this.org_features = JSON.parse(JSON.stringify(this.unban_method));
          this.dataService.isLoading = false;

          localStorage.setItem('unban_method', JSON.stringify(this.unban_method));
          localStorage.setItem('unban_method_timestamp', Date.now().toString());
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
   * Executes a bot action for the active guild and handles UI feedback.
   *
   * Disables the provided button element, sends the action request via the API,
   * and re-enables the button after completion. Displays success or error alerts
   * based on the API response and handles specific HTTP error codes for user feedback.
   *
   * @param action - The action to perform (0 or 1).
   * @param element - The HTML button element triggering the action.
   */
  protected doAction(action: 0 | 1, element: HTMLButtonElement): void {
    if (!this.dataService.active_guild) { return; }

    if (action === 0 && (this.unban_method.method_type && this.unban_method.method_type != 'BOT')) {
      if (this.isInvalidUnbanMethodInput()) { return; }
    }

    element.disabled = true;
    const sub: Subscription = this.apiService.doUnbanAction(this.dataService.active_guild.id, this.unban_method, action)
      .subscribe({
        next: (_: Object): void => {
          sub.unsubscribe();

          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant(`SUCCESS_SECURITY_UNBAN_${action}_TITLE`),
            this.translate.instant(`SUCCESS_SECURITY_UNBAN_${action}_DESC`, { method: this.unban_method.method_type ? this.unban_method.method_type : '/' }));

          if (action === 1) {  // delete action
            this.unban_method = { method_extra: null, method_type: null };
          } else {
            if (!this.unban_method.method_type || this.unban_method.method_type === 'BOT') {
              this.unban_method.method_extra = null;  // reset method input
            }
          }

          this.org_features = JSON.parse(JSON.stringify(this.unban_method));
          localStorage.setItem('unban_method', JSON.stringify(this.unban_method));
          setTimeout((): void => { element.disabled = false; }, 5000);
        },
        error: (err: HttpErrorResponse): void => {

          if (err.status === 409 && (this.unban_method.method_type && this.unban_method.method_type != 'BOT')) {
            if (this.isInvalidUnbanMethodInput()) { return; }
          } else if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else if (err.status === 0) {
            this.dataService.redirectLoginError('OFFLINE');
            return;
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }

          setTimeout((): void => { element.disabled = false; }, 5000);
          sub.unsubscribe();
        }
      });
  }

  /**
   * Executes the automod setup action for the active guild and handles UI feedback.
   *
   * Disables the provided button element, sends the action request via the API,
   * and re-enables the button after completion. Displays success or error alerts
   * based on the API response and handles specific HTTP error codes for user feedback.
   *
   * @param action - The action to perform (can only be 2).
   * @param element - The HTML button element triggering the action.
   */
  protected startAutoModSetup(action: 0 | 1 | 2, element: HTMLButtonElement): void {
    if (!this.dataService.active_guild) { return; }
    if (action !== 2) { action = 2; } // only action 2 is allowed

    element.disabled = true;
    const sub: Subscription = this.apiService.insertBotAction(this.dataService.active_guild.id, action)
      .subscribe({
        next: (_: Object): void => {
          sub.unsubscribe();

          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant("SUCCESS_SECURITY_AUTOMOD_TITLE"),
            this.translate.instant("SUCCESS_SECURITY_AUTOMOD_DESC"));
          setTimeout((): void => { element.disabled = false; }, 30000);
        },
        error: (err: HttpErrorResponse): void => {
          if (err.status === 409) {
            this.dataService.error_color = 'red';
            this.dataService.showAlert(this.translate.instant("ERROR_SECURITY_AUTOMOD_TITLE"),
              this.translate.instant("ERROR_SECURITY_AUTOMOD_DESC"));
          } else if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else if (err.status === 0) {
            this.dataService.redirectLoginError('OFFLINE');
            return;
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }

          setTimeout((): void => { element.disabled = false; }, 5000);
          sub.unsubscribe();
        }
      });

    this.modal.hideModal();
  }

  /**
   * Refreshes the cache by disabling the cache button, setting the loading state,
   * and fetching the snippet data with the cache ignored. The cache button is re-enabled
   * after 15 seconds.
   */
  protected refreshCache(): void {
    this.disabledCacheBtn = true;
    this.dataService.isLoading = true;
    this.getUnbanMethod(true);

    setTimeout((): void => { this.disabledCacheBtn = false; }, 15000);
  }

  /**
   * Sets the unban method type for the current configuration.
   *
   * @param method_type The selected unban method type ("BOT", "FORM", "EMAIL", "INVITE" or empty string).
   *                    If an empty string is provided, the method type is set to null.
   */
  protected setUnbanMethodType(method_type: "BOT" | "FORM" | "EMAIL" | "INVITE" | ''): void {
    if (method_type === '') { this.unban_method.method_type = null; return; }
    this.unban_method.method_type = method_type;


    if (this.unban_method.method_type != this.org_features.method_type && (this.unban_method.method_type === 'FORM' ||
        this.unban_method.method_type === 'EMAIL' || this.unban_method.method_type === 'INVITE')) {
      this.unban_method.method_extra = null;  // reset method input
    } else { this.unban_method.method_extra = this.org_features.method_extra; } // reset to original value
  }

  /**
   * Checks if there are unsaved changes between the original and current unban method configuration.
   * @returns `true` if changes exist, otherwise `false`.
   */
  protected hasMethodChanges(): boolean {
    return JSON.stringify(this.org_features) !== JSON.stringify(this.unban_method)
  }

  /**
   * Checks if the current unban method requires an extra value and if it is missing.
   *
   * Returns `true` if the selected method type is 'FORM', 'EMAIL' or 'INVITE' and `method_extra` is `null`.
   * Otherwise returns `false`.
   */
  protected isInvalidMethodExtra(): boolean {
    if (this.unban_method.method_type === 'FORM' || this.unban_method.method_type === 'EMAIL' || this.unban_method.method_type === 'INVITE') {
      if (this.unban_method.method_extra === null || this.unban_method.method_extra.trim() === '') {
        this.disabledSaveBtn = true;
        return true;
      }
    }

    return false;
  }

  /**
   * Validates the input for the unban method and shows appropriate error alerts.
   * @returns {boolean} true if input is invalid and an alert was shown, otherwise false.
   */
  private isInvalidUnbanMethodInput(): boolean {
    if (this.unban_method.method_extra === null || this.unban_method.method_extra.trim() === '') {
      this.dataService.error_color = 'red';
      this.dataService.showAlert(this.translate.instant('ERROR_SECURITY_UNBAN_METHOD_EMPTY_TITLE'),
        this.translate.instant('ERROR_SECURITY_UNBAN_METHOD_EMPTY_DESC'));
      return true;
    }

    if (this.unban_method.method_type) {
      if (this.unban_method.method_type === 'INVITE' && !this.unban_method.method_extra?.startsWith('https://discord.gg/')) {
        this.dataService.error_color = 'red';
        this.dataService.showAlert(this.translate.instant('ERROR_SECURITY_UNBAN_METHOD_INVALID_INVITE_TITLE'),
          this.translate.instant('ERROR_SECURITY_UNBAN_METHOD_INVALID_INVITE_DESC'));
        return true;
      } else if (this.unban_method.method_type === 'EMAIL' && (!this.unban_method.method_extra || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.unban_method.method_extra))) {
        this.dataService.error_color = 'red';
        this.dataService.showAlert(this.translate.instant('ERROR_SECURITY_UNBAN_METHOD_INVALID_EMAIL_TITLE'),
          this.translate.instant('ERROR_SECURITY_UNBAN_METHOD_INVALID_EMAIL_DESC'));
        return true;
      } else if (this.unban_method.method_type === 'FORM') {
        const urlPattern: RegExp = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
        if (this.unban_method.method_extra && !urlPattern.test(this.unban_method.method_extra)) {
          this.dataService.error_color = 'red';
          this.dataService.showAlert(this.translate.instant('ERROR_SECURITY_UNBAN_METHOD_INVALID_URL_TITLE'),
            this.translate.instant('ERROR_SECURITY_UNBAN_METHOD_INVALID_URL_DESC'));
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Provides the list of available unban methods.
   * @returns {SelectItems[]} Array of requirement options for selection dropdown.
   */
  private getUnbanMethods(): SelectItems[] {
    return [
      { value: '', label: 'PLACEHOLDER_SECURITY_UNBAN_EMPTY' },
      { value: 'BOT', label: 'PLACEHOLDER_SECURITY_UNBAN_BOT' },
      { value: 'FORM', label: 'PLACEHOLDER_SECURITY_UNBAN_FORM' },
      { value: 'EMAIL', label: 'PLACEHOLDER_SECURITY_UNBAN_EMAIL' },
      { value: 'INVITE', label: 'PLACEHOLDER_SECURITY_UNBAN_INVITE' },
    ];
  }
}
