import {AfterViewChecked, Component, OnDestroy} from '@angular/core';
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {DragNDropComponent} from "../../../../structure/util/drag-n-drop/drag-n-drop.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faHashtag, faTrash, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {initLogs, LogFeature, SecurityLogs} from "../../../../services/types/Security";
import {SelectComponent} from "../../../../structure/util/modal/templates/select/select.component";
import {ApiService} from "../../../../services/api/api.service";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {ComService} from "../../../../services/discord-com/com.service";
import {Channel} from "../../../../services/types/discord/Guilds";
import {NgOptimizedImage} from "@angular/common";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";

@Component({
  selector: 'app-logs',
  imports: [
    AlertBoxComponent,
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    DragNDropComponent,
    FaIconComponent,
    SelectComponent,
    NgOptimizedImage
  ],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss'
})
export class LogsComponent implements OnDestroy, AfterViewChecked {
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faHashtag: IconDefinition = faHashtag;
  protected readonly faTrash: IconDefinition = faTrash;
  private readonly subscription: Subscription | null;
  private refreshState: boolean = false;
  protected sendState: boolean = false;

  // Angular - Drag and Drop feature lists
  protected log_list: LogFeature[] = initLogs;
  protected selectedLog: Channel | null = null;
  protected tempLog: Channel | null = null;
  protected org_logs: LogFeature[] = JSON.parse(JSON.stringify(this.log_list));
  protected enabledFeatures: LogFeature[] = this.log_list.filter(f => f.enabled);
  protected disabledFeatures: LogFeature[] = this.log_list.filter(f => !f.enabled);

  constructor(protected dataService: DataHolderService, private apiService: ApiService, private comService: ComService,
              private translate: TranslateService) {
    document.title = 'Security Logs ~ Clank Discord-Bot';
    this.dataService.isLoading = true;
    this.getSecurityLogs(); // first call to get the server data
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.selectedLog = null;
        this.tempLog = null;
        this.dataService.security_logs = {channel_id: null, guild_thread_id: null, bot_thread_id: null, channel_roles_thread_id: null,
          message_thread_id: null, emoji_thread_id: null, join_leave_thread_id: null, unban_thread_id: null}
        this.getSecurityLogs(true);
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
   * If the guild channels and security logs are available and no log is currently selected,
   * this method sets the selected log based on the channel ID from the security logs.
   * The assignment is deferred using setTimeout to ensure the view is updated correctly.
   */
  ngAfterViewChecked(): void {
    if (this.dataService.guild_channels && this.dataService.security_logs && this.dataService.security_logs.channel_id && (!this.selectedLog || this.refreshState)) {
      setTimeout((): void => {
        this.selectedLog = this.dataService.guild_channels.find((c: Channel) => c.id === this.dataService.security_logs.channel_id) || null;
        this.tempLog = this.selectedLog;
        this.refreshState = false;
      }, 0);
    }
  }

  /**
   * Fetches security logs for the active guild.
   *
   * If cached logs exist in localStorage and are not older than 30 seconds, uses them.
   * Otherwise, requests fresh logs from the API. Updates the log list and triggers channel fetch.
   * Handles API errors and updates loading state accordingly.
   *
   * @param no_cache Optional flag to force bypassing the cache and fetch fresh data.
   */
  protected getSecurityLogs(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    this.dataService.isLoading = true;
    this.tempLog = null;
    this.selectedLog = null;

    // check if guilds are already stored in local storage (30 seconds cache)
    if ((localStorage.getItem('security_logs') && localStorage.getItem('security_logs_timestamp') &&
      localStorage.getItem('guild_vip') &&
      Date.now() - Number(localStorage.getItem('security_logs_timestamp')) < 30000 && !no_cache)) {
      if (localStorage.getItem('security_logs_type') !== 'PENDING') {
        this.getSecurityLogs(true);  // check if cached logs has the correct type
        return;
      }

      this.dataService.security_logs = JSON.parse(localStorage.getItem('security_logs') as string);
      this.dataService.has_vip = localStorage.getItem('guild_vip') === 'true';
      this.updateLogList();

      setTimeout((): void => { this.dataService.getGuildChannels(this.comService, no_cache, true, 'FORUM') }, 100);
      return;
    }

    const sub: Subscription = this.apiService.getSecurityLogsPending(this.dataService.active_guild!.id)
      .subscribe({
        next: (config: SecurityLogs): void => {
          this.dataService.security_logs = config;
          this.dataService.has_vip = config.has_vip || false;
          this.updateLogList();
          setTimeout((): void => { this.dataService.getGuildChannels(this.comService, no_cache, true, 'FORUM') }, 550);

          localStorage.setItem('security_logs', JSON.stringify(this.dataService.security_logs));
          localStorage.setItem('guild_vip', this.dataService.has_vip.toString());
          localStorage.setItem('security_logs_type', 'PENDING');
          localStorage.setItem('security_logs_timestamp', Date.now().toString());
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
   * Updates the security log forum for the active guild.
   *
   * Sends a request to update or delete the log forum channel, depending on the `delete_action` flag.
   * On success, updates the local security logs state, UI feedback, and localStorage cache.
   * On error, handles API error responses and updates the loading state.
   *
   * @param delete_action Optional flag to indicate if the log forum should be deleted.
   */
  protected saveLogForum(delete_action?: boolean): void {
    if (!this.dataService.active_guild || !this.tempLog) { return; }

    const sub: Subscription = this.apiService.updateLogForum(this.dataService.active_guild!.id, this.tempLog.id, delete_action)
      .subscribe({
        next: (_: Object): void => {
          // channel is now updated, so threads are reset
          this.dataService.security_logs = {channel_id: null, guild_thread_id: null, bot_thread_id: null,
            channel_roles_thread_id: null, message_thread_id: null, emoji_thread_id: null, join_leave_thread_id: null,
            unban_thread_id: null, channel_id_pending: true, channel_id_delete: delete_action }
          this.selectedLog = this.tempLog;
          this.updateLogList();

          this.dataService.error_color = !delete_action ? 'green' : 'red';
          this.dataService.showAlert(this.translate.instant(`SUCCESS_SECURITY_FORUM_${delete_action ? 'DELETE' : 'SET'}_TITLE`),
            this.translate.instant(`SUCCESS_SECURITY_FORUM_${delete_action ? 'DELETE' : 'SET'}_DESC`,
              { name: this.tempLog?.name, id: this.tempLog?.id }),);

          localStorage.setItem('security_logs', JSON.stringify(this.dataService.security_logs));
          sub.unsubscribe();
        },
        error: (err: HttpErrorResponse): void => {
          this.dataService.isLoading = false;

          if (err.status === 404 && delete_action) {
            this.dataService.error_color = 'red';
            this.dataService.showAlert(this.translate.instant('ERROR_SECURITY_FORUM_NOT_FOUND_TITLE'),
              this.translate.instant('ERROR_SECURITY_FORUM_NOT_FOUND_DESC', { name: this.tempLog?.name, id: this.tempLog?.id }));
            this.tempLog = null;
            return;
          } else if (err.status === 409) {
            this.dataService.error_color = 'red';
            this.dataService.showAlert(this.translate.instant(`ERROR_SECURITY_FORUM_${delete_action ? 'DELETE_' : '_'}CONFLICT_TITLE`),
              this.translate.instant(`ERROR_SECURITY_FORUM_${delete_action ? 'DELETE_' : '_'}CONFLICT_DESC`, { name: this.tempLog?.name, id: this.tempLog?.id }));
            this.tempLog = null;
            return;
          }

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
   * Saves the current log threads configuration for the active guild.
   *
   * Sends an API request to update the log threads using the current security logs.
   * On success, updates the local security logs state, refreshes the log list, shows a success alert,
   * and updates the cache in localStorage. Handles API errors and updates the loading state accordingly.
   */
  protected saveLogThreads(): void {
    if (!this.dataService.active_guild || !this.selectedLog) { return; }
    this.sendState = true;

    this.log_list.forEach((log: LogFeature): void => {
      if (log.enabled) {  // Set default value if log-thread is enabled (otherwise it is null)
        this.dataService.security_logs[log.category] = '123';
      } else { this.dataService.security_logs[log.category] = null; }});

    // Remove all *_pending and *_delete attributes before sending
    const sanitizedLogs: SecurityLogs = Object.keys(this.dataService.security_logs)
      .filter(key => !key.endsWith('_pending') && !key.endsWith('_delete') && !key.endsWith("has_vip"))
      .reduce((acc, key) =>
        {acc[key] = this.dataService.security_logs[key]; return acc;}, {} as SecurityLogs);

    this.dataService.security_logs.guild_id = this.dataService.active_guild.id;
    const sub: Subscription = this.apiService.updateLogThreads(this.dataService.active_guild.id, sanitizedLogs)
      .subscribe({
        next: (logs: SecurityLogs): void => {
          this.dataService.security_logs = logs;
          this.updateLogList();
          this.sendState = false;

          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant("SUCCESS_SECURITY_THREADS_SET_TITLE"),
            this.translate.instant("SUCCESS_SECURITY_THREADS_SET_DESC"));

          localStorage.setItem('security_logs', JSON.stringify(this.dataService.security_logs));
          sub.unsubscribe();
        },
        error: (err: HttpErrorResponse): void => {
          this.dataService.isLoading = false;
          sub.unsubscribe();

          if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else if (err.status === 402) {
            this.dataService.showAlert(this.translate.instant('ERROR_TITLE_402'),
              this.translate.instant('ERROR_UNBAN_LOG_402_DESC'));
          } else if (err.status === 0) {
            this.dataService.redirectLoginError('OFFLINE');
            return;
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }
        }
      });
  }

  /**
   * Refreshes the cache by disabling the cache button, setting the loading state,
   * and fetching the snippet data with the cache ignored. The cache button is re-enabled
   * after 10 seconds.
   */
  protected refreshCache(element: HTMLButtonElement): void {
    element.disabled = true;
    this.dataService.isLoading = true;
    this.refreshState = true;
    this.getSecurityLogs(true);

    setTimeout((): void => { element.disabled = false; }, 10000);
  }

  /**
   * Synchronizes log_list with the current security_logs data.
   * Each LogFeature.enabled is set to true if the corresponding thread_id in security_logs is not null.
   */
  protected updateLogList(): void {
    if (!this.dataService.security_logs) return;

    this.log_list = this.log_list.map(log => {
      const securityLogs = this.dataService.security_logs as Record<string, any>;
      const mainValue = securityLogs[log.category];
      const pendingValue = securityLogs[`${log.category}_pending`];
      const deleteValue = securityLogs[`${log.category}_delete`];

      // Enabled if (mainValue exists and is not marked for deletion) or (pending and not marked for deletion)
      return {...log, enabled: (mainValue != null || pendingValue === true) && deleteValue !== true};
    });

    this.enabledFeatures = this.log_list.filter(f => f.enabled);
    this.disabledFeatures = this.log_list.filter(f => !f.enabled);
    this.org_logs = JSON.parse(JSON.stringify(this.log_list));
  }

  /**
   * Returns the channel object from the guild channels list that matches the given channel ID.
   * If no channel is found, returns null.
   *
   * @param channel_id - The ID of the channel to search for.
   * @returns The matching Channel object or null if not found.
   */
  protected setTempLog(channel_id: string): Channel | null {
    return this.dataService.guild_channels.find((c: Channel) => c.id === channel_id) || null
  }
}
