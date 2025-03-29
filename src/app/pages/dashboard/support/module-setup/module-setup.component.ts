import {Component, OnDestroy} from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {forkJoin, Subscription} from "rxjs";
import {ApiService} from "../../../../services/api/api.service";
import {SubTasksCompletion, TasksCompletion, TasksCompletionList} from "../../../../services/types/Tasks";
import {HttpErrorResponse} from "@angular/common/http";
import {Channel, SupportSetup} from "../../../../services/types/discord/Guilds";

@Component({
  selector: 'app-module-setup',
  imports: [
    DashboardLayoutComponent,
    NgOptimizedImage,
    NgClass,
    RouterLink
  ],
  templateUrl: './module-setup.component.html',
  styleUrl: './module-setup.component.scss'
})
export class ModuleSetupComponent implements OnDestroy {
  protected moduleStatus: 0 | 1 | 2 = 0; // 0 = Not started, 1 = In progress, 2 = Completed
  protected currentStep: 1 | 2 | 3 = 1;
  protected channelItems: Channel[] = [];

  protected selectedChannelId: string | null = null;
  private subscriptions: Subscription[] = [];
  protected cacheRefreshDisabled: boolean = false;
  protected moduleStatusObj: TasksCompletion | undefined;
  protected supportForum: Channel | undefined;

  protected statusTitle: string = 'MODUL NICHT AKTIV!';
  protected statusText: string = 'Du hast alle Empfohlenen Einstellungen vorgenommen und das Support-System kann nun genutzt werden.';

  constructor(private dataService: DataHolderService, private apiService: ApiService) {
    document.title = 'Support Setup ~ Clank Discord-Bot';

    this.getServerData(); // first call to get the server data
    const sub: Subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.getServerData(true);
      }
    });

    this.subscriptions.push(sub);
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   *
   * This method unsubscribes from all active subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getServerData(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    if (no_cache) { this.dataService.isLoading = true; }

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
          this.supportForum = supportSetup['support_forum'];
          this.selectedChannelId = this.supportForum!.id;
        }

        this.moduleStatusObj = moduleStatus['task_1'];
        this.channelItems = supportSetup['discord_channels'];
        this.updateStatus();
        this.dataService.isLoading = false;
        return;
      }
    }

    const sub: Subscription = forkJoin({moduleStatus: this.apiService.getModuleStatus(this.dataService.active_guild!.id),
                                        supportSetup: this.apiService.getSupportSetupStatus(this.dataService.active_guild!.id)})
      .subscribe({
        next: ({ moduleStatus, supportSetup }: { moduleStatus: TasksCompletionList, supportSetup: SupportSetup }): void => {
          localStorage.setItem('moduleStatus', JSON.stringify(moduleStatus));
          moduleStatus['task_1'].subtasks.pop(); // remove last element, it's not needed
          this.moduleStatusObj = moduleStatus['task_1'];
          this.updateStatus();

          if (supportSetup.support_forum != null) {
            this.supportForum = supportSetup.support_forum;
            this.selectedChannelId = this.supportForum!.id;
          }

          this.channelItems = supportSetup['discord_channels'];
          localStorage.setItem('supportSetup', JSON.stringify(supportSetup));
          localStorage.setItem('moduleStatusTimestamp', Date.now().toString());
          this.dataService.isLoading = false;
        },
        error: (err: HttpErrorResponse): void => {
          if (err.status === 403) {
            this.dataService.redirectLoginError('FORBIDDEN');
            return;
          } else if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else if (err.status === 0) {
            this.dataService.redirectLoginError('OFFLINE');
            return;
          }
          this.dataService.isLoading = false;
        }
      });

    this.subscriptions.push(sub);
  }

  /**
   * Refreshes the cached data by fetching fresh data from the server.
   */
  refreshCache(): void {
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
  updateStatus(): void {
    if (!this.moduleStatusObj) { return; }

    // all tasks finished
    if (this.moduleStatusObj.finished) {
      this.moduleStatus = 2;
      this.statusTitle = 'MODUL VOLLSTÄNDIG EINGERICHTET!';
      this.statusText = 'Du hast alle Empfohlenen Einstellungen vorgenommen und das Support-System kann nun genutzt werden.';
      return;
    }

    // subtasks incomplete
    else if (this.moduleStatusObj.subtasks.some((subtask: SubTasksCompletion): boolean => !subtask.finished)) {
      // check if support channel was set; if not, critical error
      if (this.moduleStatusObj.subtasks[0]?.finished === false) {
        this.moduleStatus = 0;
        this.statusTitle = 'MODUL NICHT AKTIV!';
        this.statusText = 'Es können aktuell keine Support-Tickets auf deinem Discord-Server erstellt werden.';
      } else {
        this.moduleStatus = 1;
        this.statusTitle = 'SYSTEM AKTIV - VERBESSERUNGEN MÖGLICH!';
        this.statusText = 'Support-Tickets können erstellt werden, aber es sind noch Einstellungen empfohlen, die eure Arbeit erleichtern.';
      }
    }
  }

  /**
   * Toggles the selection of a channel.
   *
   * If the selected channel ID matches the provided ID, it deselects the channel (sets to null).
   * Otherwise, it selects the provided channel ID.
   *
   * @param id The ID of the channel to toggle selection for
   */
  protected selectChannel(id: string): void {
    this.selectedChannelId = this.selectedChannelId === id ? null : id;
  }

}
