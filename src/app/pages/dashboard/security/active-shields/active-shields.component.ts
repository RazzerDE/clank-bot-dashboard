import {Component, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {faHashtag, faRotateLeft, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faRefresh} from "@fortawesome/free-solid-svg-icons";
import {faVolumeHigh} from "@fortawesome/free-solid-svg-icons";
import {faAt} from "@fortawesome/free-solid-svg-icons";
import {BackupData, initFeatures, SecurityFeature, SecurityFeatureRaw} from "../../../../services/types/Security";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "../../../../services/api/api.service";
import {ModalComponent} from "../../../../structure/util/modal/modal.component";
import {DragNDropComponent} from "../../../../structure/util/drag-n-drop/drag-n-drop.component";

@Component({
  selector: 'app-active-shields',
  imports: [
    AlertBoxComponent,
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent,
    NgClass,
    NgOptimizedImage,
    ModalComponent,
    DragNDropComponent,
  ],
  templateUrl: './active-shields.component.html',
  styleUrl: './active-shields.component.scss'
})
export class ActiveShieldsComponent implements OnDestroy {
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faRotateLeft: IconDefinition = faRotateLeft;
  protected readonly faHashtag: IconDefinition = faHashtag;
  protected readonly faVolumeHigh: IconDefinition = faVolumeHigh;
  protected readonly faAt: IconDefinition = faAt;

  protected security_features: SecurityFeature[] = initFeatures;
  protected org_features: SecurityFeature[] = JSON.parse(JSON.stringify(this.security_features));
  protected enabledFeatures: SecurityFeature[] = this.security_features.filter(f => f.enabled);
  protected disabledFeatures: SecurityFeature[] = this.security_features.filter(f => !f.enabled);
  protected backup_data: BackupData = {enabled: true, backup_date: 1752686998, channels: [], roles: []};

  protected disabledSendBtn: boolean = false;
  private readonly subscription: Subscription | null = null;

  @ViewChild(ModalComponent) private modal!: ModalComponent;
  protected modalAction: 0 | 1 = 0; // 0 = panic, 1 = backup restore
  protected modalElement: HTMLButtonElement | null = null;

  constructor(protected dataService: DataHolderService, protected translate: TranslateService, private apiService: ApiService) {
    document.title = 'Active Shields ~ Clank Discord-Bot';
    this.dataService.isLoading = true;
    this.getSecurityShields();
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.getSecurityShields(true);
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
   * Fetches the security shields for the active guild.
   *
   * Retrieves cached data from localStorage if available and valid (within 60 seconds),
   * otherwise requests fresh data from the API. Updates the enabled and disabled features lists.
   * On success, stores the result in localStorage and triggers backup data retrieval.
   * Handles API errors and sets appropriate loading and error states.
   *
   * @param no_cache Optional flag to ignore cache and force API request.
   */
  protected getSecurityShields(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    this.dataService.isLoading = true;

    // check if guilds are already stored in local storage (60 seconds cache)
    if ((localStorage.getItem('security_shields') && localStorage.getItem('security_shields_timestamp') &&
      localStorage.getItem('guild_vip') &&
      Date.now() - Number(localStorage.getItem('security_shields_timestamp')) < 60000 && !no_cache)) {
      this.security_features = JSON.parse(localStorage.getItem('security_shields') as string);
      this.org_features = JSON.parse(JSON.stringify(this.security_features));
      this.dataService.has_vip = localStorage.getItem('guild_vip') === 'true';
      this.enabledFeatures = this.security_features.filter(f => f.enabled);
      this.disabledFeatures = this.security_features.filter(f => !f.enabled);

      setTimeout((): void => { this.getBackupData(no_cache) }, 100);
      return;
    }

    const sub: Subscription = this.apiService.getSecurityShields(this.dataService.active_guild.id)
      .subscribe({
        next: (response: SecurityFeatureRaw): void => {
          this.security_features = response.shields;
          this.dataService.has_vip = response.has_vip;
          this.org_features = JSON.parse(JSON.stringify(this.security_features));
          this.enabledFeatures = this.security_features.filter(f => f.enabled);
          this.disabledFeatures = this.security_features.filter(f => !f.enabled);

          setTimeout((): void => { this.getBackupData(no_cache) }, 550);
          localStorage.setItem('security_shields', JSON.stringify(response.shields));
          localStorage.setItem('guild_vip', this.dataService.has_vip.toString());
          localStorage.setItem('security_shields_timestamp', Date.now().toString());
          sub.unsubscribe();
        },
        error: (err: HttpErrorResponse): void => {
          this.dataService.isLoading = false;

          if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else if (err.status === 404) { // intended, no shields found
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
   * Fetches backup data for the active guild.
   *
   * Retrieves cached backup data from localStorage if available and valid (within 60 seconds),
   * otherwise requests fresh data from the API. Updates the backup data property and loading state.
   * On success, stores the result in localStorage. Handles API errors and sets appropriate states.
   *
   * @param no_cache Optional flag to ignore cache and force API request.
   */
  private getBackupData(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }

    // check if guilds are already stored in local storage (60 seconds cache)
    if ((localStorage.getItem('security_backup') && localStorage.getItem('security_backup_timestamp') &&
      Date.now() - Number(localStorage.getItem('security_backup_timestamp')) < 60000 && !no_cache)) {
      this.backup_data = JSON.parse(localStorage.getItem('security_backup') as string);
      this.dataService.isLoading = false;
      return;
    }

    const sub: Subscription = this.apiService.getBackupData(this.dataService.active_guild.id)
      .subscribe({
        next: (data: BackupData): void => {
          data.enabled = true
          this.backup_data = data;

          this.dataService.isLoading = false;
          localStorage.setItem('security_backup', JSON.stringify(this.backup_data));
          localStorage.setItem('security_backup_timestamp', Date.now().toString());
          sub.unsubscribe();
        },
        error: (err: HttpErrorResponse): void => {
          this.dataService.isLoading = false;

          if (err.status === 404) {
            this.backup_data = { enabled: false, backup_date: null, channels: [], roles: [] };
            localStorage.setItem('security_backup', JSON.stringify(this.backup_data));
            localStorage.setItem('security_backup_timestamp', Date.now().toString());
          } else if (err.status === 429) {
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
    element.disabled = true;

    const sub: Subscription = this.apiService.insertBotAction(this.dataService.active_guild.id, action)
      .subscribe({
        next: (_: Object): void => {
          sub.unsubscribe();

          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant(`SUCCESS_SECURITY_ACTION_${action}_TITLE`),
            this.translate.instant(`SUCCESS_SECURITY_ACTION_${action}_DESC`));

          setTimeout((): void => { element.disabled = false; }, 5000);
        },
        error: (err: HttpErrorResponse): void => {
          if (err.status === 409) {
            this.dataService.error_color = 'red';

            this.dataService.showAlert(this.translate.instant(`ERROR_SECURITY_ACTION_${action}_TITLE`),
              this.translate.instant(`ERROR_SECURITY_ACTION_${action}_DESC`));
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
   * Saves the current security shields configuration for the active guild.
   *
   * Disables the provided button element to prevent duplicate submissions,
   * sends the updated shields array to the backend via the API,
   * and provides user feedback based on the response.
   *
   * @param shields Array of SecurityFeature objects representing the current configuration.
   */
  protected saveSecurityTools(shields: SecurityFeature[]): void {
    if (!this.dataService.active_guild) { return; }
    this.disabledSendBtn = true;

    const sub: Subscription = this.apiService.saveSecurityShields(this.dataService.active_guild.id, shields)
      .subscribe({
        next: (_: Object): void => {
          sub.unsubscribe();
          this.org_features = JSON.parse(JSON.stringify(shields));
          localStorage.setItem('security_shields', JSON.stringify(shields));

          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant("SUCCESS_SECURITY_SHIELDS_SAVE_TITLE"),
            this.translate.instant("SUCCESS_SECURITY_SHIELDS_SAVE_DESC"));

          setTimeout((): void => { this.disabledSendBtn = false; }, 5000);
        },
        error: (err: HttpErrorResponse): void => {
          if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else if (err.status === 0) {
            this.dataService.redirectLoginError('OFFLINE');
            return;
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }

          setTimeout((): void => { this.disabledSendBtn = false; }, 2000);
          sub.unsubscribe();
        }
      });
  }

  /**
   * Opens the confirmation modal for a security action.
   *
   * @param action The action to confirm (0 = panic, 1 = backup restore).
   * @param element The HTML button element that triggered the modal.
   */
  protected openConfirmModal(action: 0 | 1, element: HTMLButtonElement): void {
    if (action == 1 && !this.dataService.active_guild?.owner) {
      this.dataService.showAlert(this.translate.instant("ERROR_SECURITY_ACTION_1_NOT_OWNER_TITLE"),
        this.translate.instant("ERROR_SECURITY_ACTION_1_NOT_OWNER_DESC"));
      return;
    }

    this.modalElement = element;
    this.modalAction = action;

    this.modal.showModal();
  }

  /**
   * Formats the backup date for display based on the current language.
   *
   * @param backupDate Unix timestamp (in seconds) or undefined
   * @param lang Current language code ('de', 'en', etc.)
   * @returns Formatted date string or '-'
   */
  protected formatBackupDate(backupDate?: number, lang: string = 'de'): string {
    if (!backupDate) return '-';
    const date = new Date(backupDate);
    if (lang === 'de') {
      return date.toLocaleString('de-DE',
        { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' Uhr';
    }
    return date.toLocaleString('en-US',
      { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  }

  /**
   * Returns the next scheduled backup date as a formatted string based on the provided language.
   * The backup is scheduled daily at 6:00 and 18:00. If the current time is before 6:00, returns today's 6:00.
   *
   * If before 18:00, returns today's 18:00. Otherwise, returns 6:00 of the next day.
   * The output is localized for German (`de`) or English (`en`).
   *
   * @param lang - Language code for formatting ('de' for German, otherwise English).
   * @returns Formatted date string of the next backup.
   */
  protected getNextBackupDate(lang: string): string {
    const now = new Date();
    const six = new Date(now);
    six.setHours(6, 0, 0, 0);
    const eighteen = new Date(now);
    eighteen.setHours(18, 0, 0, 0);

    let next: Date;
    if (now < six) {
      next = six;
    } else if (now < eighteen) {
      next = eighteen;
    } else {
      next = new Date(now);
      next.setDate(now.getDate() + 1);
      next.setHours(6, 0, 0, 0);
    }

    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric',
                                                      hour: '2-digit', minute: '2-digit', hour12: lang !== 'de' };

    let formatted: string = next.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US', dateOptions);
    if (lang === 'de') formatted += ' Uhr';

    return formatted;
  }

  /**
   * Handles document click events to close modals if the user clicks outside of them.
   *
   * @param {MouseEvent} event - The click event triggered on the document.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).id.includes('modal_container')) {
      this.modal.hideModal();
      return;
    }
  }
}
