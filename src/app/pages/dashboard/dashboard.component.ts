import {AfterViewInit, Component} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
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
import {Tasks, tasks} from "./types/Tasks";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons/faChevronRight";
import {animate, style, transition, trigger} from "@angular/animations";
import {RouterLink} from "@angular/router";

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
  protected readonly tasks: Tasks[] = tasks;

  protected readonly localStorage: Storage = localStorage;
  protected readonly Math: Math = Math;
  protected readonly Intl = Intl;

  protected readonly faDiscord: IconDefinition = faDiscord;
  protected readonly faTruckMedical: IconDefinition = faTruckMedical;
  protected readonly faChevronRight: IconDefinition = faChevronRight;

  constructor(protected authService: AuthService, protected dataService: DataHolderService,
              private translate: TranslateService, private apiService: ApiService) {
    this.dataService.isLoading = true;
    this.authService.discordLogin();

    // get server data for serverlist
    this.getServerData();
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
   * Retrieves the server data for the server list.
   * Makes a GET request to the backend API to retrieve the server data.
   */
  getServerData(): void {
    this.apiService.getGuildUsage(100).subscribe({
      next: (response: SliderItems[]): void => {
        this.servers = response;
        this.dataService.isLoading = false;
      },
      error: (_err: HttpErrorResponse): void => {
        this.dataService.isLoading = false;
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
