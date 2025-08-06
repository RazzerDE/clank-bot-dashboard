import {AfterViewChecked, Component, OnDestroy} from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {Subscription} from "rxjs";
import {ApiService} from "../../../../services/api/api.service";
import {SubTasksCompletion, TasksCompletion, TasksCompletionList} from "../../../../services/types/Tasks";
import {HttpErrorResponse} from "@angular/common/http";
import {Channel, SupportSetup} from "../../../../services/types/discord/Guilds";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {ComService} from "../../../../services/discord-com/com.service";
import {animate, style, transition, trigger} from "@angular/animations";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";

@Component({
  selector: 'app-module-setup',
  imports: [
    DashboardLayoutComponent,
    NgOptimizedImage,
    NgClass,
    RouterLink,
    TranslatePipe,
    AlertBoxComponent
  ],
  templateUrl: './module-setup.component.html',
  styleUrl: './module-setup.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class ModuleSetupComponent implements OnDestroy, AfterViewChecked {
  protected moduleStatus: 0 | 1 | 2 = 0; // 0 = Not started, 1 = In progress, 2 = Completed
  protected currentStep: 1 | 2 | 3 = 1;
  protected channelItems: Channel[] = [];

  protected selectedChannel: Channel | null = null;
  private readonly subscription: Subscription | null = null;
  protected cacheRefreshDisabled: boolean = false;
  protected moduleStatusObj: TasksCompletion | undefined;
  protected supportForum: { channel: Channel | null, pending: boolean } = { channel: null, pending: false };

  private startLoading: boolean = false;
  protected dataLoading: { statusBox: boolean, channelItems: boolean } = { statusBox: true, channelItems: true };

  constructor(protected dataService: DataHolderService, private apiService: ApiService,
              private discordService: ComService, private translate: TranslateService) {
    document.title = 'Support Setup ~ Clank Discord-Bot';

    this.getServerData(); // first call to get the server data
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataLoading = { statusBox: true, channelItems: true };
        this.supportForum = { channel: null, pending: false };
        this.cacheRefreshDisabled = false;
        this.selectedChannel = null;
        this.getServerData(true);
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
   * setTimeout is used to ensure that the loading state is updated after the view has been rendered.
   *
   * It's used to show a loading state for some data related things.
   */
  ngAfterViewChecked(): void {
    if (this.moduleStatusObj && this.moduleStatusObj.subtasks.length == 3 && this.dataLoading.statusBox) {
      setTimeout((): boolean => this.dataLoading.statusBox = false, 0);
    }

    if (!this.startLoading && this.dataLoading.channelItems) {
      setTimeout((): boolean => this.dataLoading.channelItems = false, 0);
    }
  }

  /**
   * Fetches the server data, either from cache or by making API calls.
   *
   * This method first checks if the `active_guild` is set in the `dataService`.
   * If `no_cache` is true, it sets the loading state to true.
   * It then checks if cached data is available and valid (within 5 minutes).
   * If valid cached data is found, it uses the cached data to set the module status and channel items.
   * If no valid cached data is found, it makes API calls to fetch the module status and support setup status.
   * The fetched data is then cached and used to update the module status and channel items.
   *
   * @param no_cache Optional boolean to force fetching fresh data from the server.
   */
  private getServerData(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    if (no_cache) { this.dataService.isLoading = true; }
    this.supportForum = { channel: null, pending: false };
    this.selectedChannel = null;
    this.startLoading = true;

    // check if cache data is available
    const cachedStatus = localStorage.getItem('moduleStatus');
    const cachedTimestamp = localStorage.getItem('moduleStatusTimestamp');
    const cachedSupportSetup = localStorage.getItem('supportSetup');
    if (!no_cache && cachedStatus && cachedTimestamp && cachedSupportSetup) {
      const timestamp = parseInt(cachedTimestamp);
      if (Date.now() - timestamp < 300000) { // 5 minutes
        const moduleStatus: TasksCompletionList = JSON.parse(cachedStatus);
        if (!moduleStatus) { localStorage.removeItem('moduleStatus'); return; }

        // Remove last element from subtasks if it exists
        if (moduleStatus && moduleStatus['task_1'].subtasks.length > 3) {
          moduleStatus['task_1'].subtasks.pop();
        }

        const supportSetup: any = JSON.parse(cachedSupportSetup);
        if (supportSetup['support_forum'] != null) {
          this.supportForum = { channel: supportSetup['support_forum'], pending: supportSetup['support_forum_pending'] };
          this.selectedChannel = this.supportForum.channel;
        }

        this.moduleStatusObj = moduleStatus['task_1'];
        this.channelItems = supportSetup['discord_channels'];
        this.updateStatus();
        this.dataService.isLoading = false;
        this.startLoading = false;
        return;
      }
    }

    let sub: Subscription | null = null;
    let sub2: Subscription | null = null;
    sub = this.apiService.getModuleStatus(this.dataService.active_guild!.id, no_cache)
      .subscribe({
        next: (moduleStatus: TasksCompletionList): void => {
          localStorage.setItem('moduleStatus', JSON.stringify(moduleStatus));
          moduleStatus['task_1'].subtasks.pop(); // remove last element, it's not needed
          this.moduleStatusObj = moduleStatus['task_1'];
          this.updateStatus();
          if (sub) { sub.unsubscribe(); }

          // after first call was a success, we call the next
          setTimeout((): void => {
            sub2 = this.apiService.getSupportSetupStatus(this.dataService.active_guild!.id)
              .subscribe({
                next: (supportSetup: SupportSetup): void => {
                  if (supportSetup.support_forum != null) {
                    this.supportForum = { channel: supportSetup.support_forum, pending: supportSetup.support_forum_pending };
                    this.selectedChannel = supportSetup.support_forum;
                  }

                  this.channelItems = supportSetup['discord_channels'];
                  localStorage.setItem('supportSetup', JSON.stringify(supportSetup));
                  localStorage.setItem('moduleStatusTimestamp', Date.now().toString());
                  this.dataService.isLoading = false;
                  this.startLoading = false;
                  if (sub2) { sub2.unsubscribe(); }
                }, error: (error: HttpErrorResponse): void => {
                  if (sub2) {sub2.unsubscribe(); }
                  this.dataService.handleApiError(error) }
              }); }, 1000);
        }, error: (error: HttpErrorResponse): void => {
          if (sub) { sub.unsubscribe(); }
          this.dataService.handleApiError(error) }
      });
  }

  /**
   * Sets the support forum channel for the active guild.
   *
   * This method sends a request to the Discord service to set the support forum channel
   * for the active guild. If the request is successful, it updates the `supportForum` object
   * and removes the cached support setup. It also displays a success alert.
   * If the request fails, it handles different error statuses by displaying appropriate alerts
   * or redirecting to the login page.
   *
   * @param channel The channel object to be set as the support forum.
   */
  protected setForumChannel(channel: Channel): void {
    if (!this.dataService.active_guild) { return; }
    this.dataService.isDisabledSpamBtn = true;

    this.discordService.setSupportForum(this.dataService.active_guild.id, channel.id)
      .then((observable) => {
        const subscription: Subscription = observable.subscribe({
          next: (_response: null): void => {
            this.supportForum = { channel: channel, pending: true };
            localStorage.removeItem('supportSetup');

            this.dataService.error_color = 'green';
            this.dataService.showAlert(this.translate.instant('SUCCESS_SAVE'), this.translate.instant('SUCCESS_FORUM_DESC'));
            subscription.unsubscribe();
            setTimeout((): void => { this.dataService.isDisabledSpamBtn = false; }, 250);
          },
          error: (err: HttpErrorResponse): void => {
            if (err.status === 409) {
              this.dataService.error_color = 'red';
              this.dataService.showAlert(this.translate.instant('ERROR_SAVE'), this.translate.instant('ERROR_FORUM_DESC'));
            } else if (err.status === 429) {
              this.dataService.redirectLoginError('REQUESTS');
            } else if (err.status === 403) {
              this.dataService.redirectLoginError('FORBIDDEN');
            } else {
              this.dataService.redirectLoginError('EXPIRED');
            }

            subscription.unsubscribe();
            setTimeout((): void => { this.dataService.isDisabledSpamBtn = false; }, 250);
          }
        });
      });
  }

  /**
   * Refreshes the cached data by fetching fresh data from the server.
   */
  protected refreshCache(): void {
    this.cacheRefreshDisabled = true;
    this.dataService.isLoading = true;
    this.getServerData(true);

    setTimeout((): void => { this.cacheRefreshDisabled = false; }, 60000); // 60 seconds
  }

  /**
   * Updates the module status based on the completion state of tasks and subtasks.
   *
   * This method evaluates the current state of the support module setup by checking:
   * - If all tasks are finished, sets the module status to "completed" (2)
   * - If the critical support channel setup is missing, sets the module status to "not active" (0)
   * - Otherwise, if some subtasks are incomplete but the support channel is set up,
   *   sets the module status to "in progress" (1)
   */
  private updateStatus(): void {
    if (!this.moduleStatusObj) { return; }

    // all tasks finished
    if (this.moduleStatusObj.finished) {
      this.moduleStatus = 2;
    }

    // subtasks incomplete
    else if (this.moduleStatusObj.subtasks.some((subtask: SubTasksCompletion): boolean => !subtask.finished)) {
      // check if support channel was set; if not, critical error
      if (this.moduleStatusObj.subtasks[0]?.finished === false) {
        this.moduleStatus = 0;
      } else {
        this.moduleStatus = 1;
      }
    }
  }

  /**
   * Toggles the selection of a channel.
   *
   * If the selected channel ID matches the provided ID, it deselects the channel (sets to null).
   * Otherwise, it selects the provided channel ID.
   *
   * @param channel The channel object to be selected or deselected.
   */
  protected selectChannel(channel: Channel): void {
    this.selectedChannel = this.selectedChannel === channel ? null : channel;
  }

}
