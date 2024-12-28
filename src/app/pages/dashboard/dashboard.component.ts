import {AfterViewInit, Component} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {DataHolderService} from "../../services/data/data-holder.service";
import {SidebarComponent} from "../../structure/sidebar/sidebar.component";
import {HeaderComponent} from "../../structure/header/header.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faDiscord} from "@fortawesome/free-brands-svg-icons";
import {faTruckMedical} from "@fortawesome/free-solid-svg-icons";
import {ApiService} from "../../services/api/api.service";
import {HttpErrorResponse} from "@angular/common/http";
import {SliderItems} from "../../services/types/landing-page/SliderItems";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, NgClass, NgOptimizedImage, TranslatePipe, FaIconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements AfterViewInit {
  protected servers: SliderItems[] = [];

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

  protected readonly localStorage = localStorage;
  protected readonly faDiscord = faDiscord;
  protected readonly Math = Math;
  protected readonly faTruckMedical = faTruckMedical;
  protected readonly Intl = Intl;
}
