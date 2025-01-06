import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {DataHolderService} from "../../services/data/data-holder.service";
import {SidebarComponent} from "../../structure/sidebar/sidebar.component";
import {HeaderComponent} from "../../structure/header/header.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ApiService} from "../../services/api/api.service";
import {HttpErrorResponse} from "@angular/common/http";
import {SliderItems} from "../../services/types/landing-page/SliderItems";
import {faDiscord} from "@fortawesome/free-brands-svg-icons";
import {faTruckMedical, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons/faChevronRight";
import {animate, style, transition, trigger} from "@angular/animations";
import {RouterLink} from "@angular/router";
import {forkJoin} from "rxjs";
import {SubTasks, Tasks, tasks, TasksCompletionList} from "../../services/types/Tasks";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, NgClass, NgOptimizedImage, TranslatePipe, FaIconComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out',
          style({ height: '*', opacity: 1, overflow: 'hidden' })
        )
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('300ms ease-out',
          style({ height: 0, opacity: 0, overflow: 'hidden' })
        )
      ])
    ])
  ]
})
export class DashboardComponent implements AfterViewInit {
  protected servers: SliderItems[] = [];
  protected expandedTasks: number[] = [];
  protected tasks: Tasks[] = tasks;
  @ViewChild('dashboardContainer') protected dashboardContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('tasklistContainer') protected tasklistContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('tasklistDiv') protected tasklistDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('serverlistContainer') protected serverlistContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('serverlistDiv') protected serverlistDiv!: ElementRef<HTMLDivElement>;

  protected readonly localStorage: Storage = localStorage;
  protected readonly Math: Math = Math;
  protected readonly Intl = Intl;
  protected readonly window: Window = window;

  protected readonly faDiscord: IconDefinition = faDiscord;
  protected readonly faTruckMedical: IconDefinition = faTruckMedical;
  protected readonly faChevronRight: IconDefinition = faChevronRight;

  constructor(protected dataService: DataHolderService, private translate: TranslateService,
              private apiService: ApiService) {
    this.dataService.isLoading = true;
    this.dataService.hideGuildSidebar = false;

    this.getServerData(); // first call to get the server data
    this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.getServerData();
      }
    });
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * Subscribes to language change events and updates the document title accordingly.
   * Also sets the `isLoading` flag in the `DataHolderService` to `false` after the language change event.
   */
  ngAfterViewInit(): void {
    this.translate.onLangChange.subscribe((): void => {
      document.title = "Dashboard ~ Clank Discord-Bot";
    });
  }

  /**
   * Retrieves the server data for the server list and gets the module completion status.
   * Makes a GET request to the backend API to retrieve the server data.
   */
  getServerData(): void {
    if (!this.dataService.active_guild) { return; }
    if (!document.location.href.endsWith('/dashboard')) { return; }

    forkJoin({guildUsage: this.apiService.getGuildUsage(100),
              moduleStatus: this.apiService.getModuleStatus(this.dataService.active_guild!.id)})
      .subscribe({
        next: ({ guildUsage, moduleStatus }: { guildUsage: SliderItems[], moduleStatus: TasksCompletionList }): void => {
          this.updateTasks(moduleStatus);
          this.servers = guildUsage;
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
  }

  /**
   * Updates the tasks with their completion status based on the provided module status.
   *
   * @param moduleStatus - The status of the modules, containing information about the completion of tasks and subtasks.
   */
  private updateTasks(moduleStatus: TasksCompletionList): void {
    this.tasks.forEach(task => {
      const status = moduleStatus[`task_${task.id}`];
      if (status) {
        task.finished = status.finished;
        task.subtasks.forEach(subtask => {
          const matchingSubtask = status.subtasks.find(st => st.id === subtask.id.toString());
          if (matchingSubtask) {
            subtask.finished = matchingSubtask.finished;
          }
        });
      }
    });
  }

  /**
   * Toggles the expansion state of a task.
   * If the task is currently expanded, it will be collapsed.
   * If the task is currently collapsed, it will be expanded.
   *
   * @param taskId - The ID of the task to toggle.
   */
  toggleTask(taskId: number): void {
    const index: number = this.expandedTasks.indexOf(taskId);
    if (index === -1) {
      this.expandedTasks.push(taskId);
    } else {
      this.expandedTasks.splice(index, 1);
    }
  }

  /**
   * Checks if the main task (based of the given subtasks) is in progress.
   *
   * @param subtasks - The list of subtasks to check.
   * @returns `true` if any subtask is finished, otherwise `false`.
   */
  isInProgress(subtasks: SubTasks[]): boolean {
    return subtasks.some(subtask => subtask.finished)
  }

  /**
   * Calculates the number of completed tasks.
   * This includes both main tasks and subtasks that are marked as finished.
   *
   * @returns The number of completed tasks.
   */
  get completedTasks(): number {
    return this.tasks.filter(t => t.finished).length +
      this.tasks.flatMap(t => t.subtasks).filter(s => s.finished).length;
  }

  /**
   * Calculates the total number of tasks, including both main tasks and subtasks.
   *
   * @returns The total number of tasks.
   */
  get totalTasks(): number {
    return this.tasks.length + this.tasks.flatMap(t => t.subtasks).length;
  }
}
