import {AfterViewChecked, Component, OnDestroy} from '@angular/core';
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
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

  // Angular - Drag and Drop feature lists
  protected log_list: LogFeature[] = initLogs;
  protected selectedLog: Channel | null = null;
  protected tempLog: Channel | null = null;
  protected org_logs: LogFeature[] = JSON.parse(JSON.stringify(this.log_list));
  protected enabledFeatures: LogFeature[] = this.log_list.filter(f => f.enabled);
  protected disabledFeatures: LogFeature[] = this.log_list.filter(f => !f.enabled);

  constructor(protected dataService: DataHolderService, private apiService: ApiService, private comService: ComService) {
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
    if (this.dataService.guild_channels && this.dataService.security_logs && this.dataService.security_logs.channel_id && !this.selectedLog) {
      setTimeout((): void => {
        this.selectedLog = this.dataService.guild_channels.find((c: Channel) => c.id === this.dataService.security_logs.channel_id) || null;
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
  getSecurityLogs(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    this.dataService.isLoading = true;

    // check if guilds are already stored in local storage (30 seconds cache)
    if ((localStorage.getItem('security_logs') && localStorage.getItem('security_logs_timestamp') &&
      Date.now() - Number(localStorage.getItem('security_logs_timestamp')) < 30000 && !no_cache)) {
      this.dataService.security_logs = JSON.parse(localStorage.getItem('security_logs') as string);
      this.updateLogList();

      setTimeout((): void => { this.dataService.getGuildChannels(this.comService, no_cache, true, 'FORUM') }, 100);
      return;
    }

    const sub: Subscription = this.apiService.getSecurityLogsPending(this.dataService.active_guild!.id)
      .subscribe({
        next: (config: SecurityLogs): void => {
          this.dataService.security_logs = config;
          this.updateLogList();
          setTimeout((): void => { this.dataService.getGuildChannels(this.comService, no_cache, true, 'FORUM') }, 550);

          localStorage.setItem('security_logs', JSON.stringify(this.dataService.security_logs));
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
   * Refreshes the cache by disabling the cache button, setting the loading state,
   * and fetching the snippet data with the cache ignored. The cache button is re-enabled
   * after 10 seconds.
   */
  protected refreshCache(element: HTMLButtonElement): void {
    element.disabled = true;
    this.dataService.isLoading = true;
    this.getSecurityLogs(true);

    setTimeout((): void => { element.disabled = false; }, 10000);
  }

  /**
   * Synchronizes log_list with the current security_logs data.
   * Each LogFeature.enabled is set to true if the corresponding thread_id in security_logs is not null.
   */
  protected updateLogList(): void {
    if (!this.dataService.security_logs) return;
    this.log_list = this.log_list.map(log => ({...log,
      enabled: (this.dataService.security_logs as Record<string, any>)[log.category] != null}));

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
