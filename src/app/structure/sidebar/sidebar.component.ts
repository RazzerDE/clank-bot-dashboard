import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {faChevronRight} from "@fortawesome/free-solid-svg-icons/faChevronRight";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {AuthService} from "../../services/auth/auth.service";
import {DataHolderService} from "../../services/data/data-holder.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {TranslatePipe} from "@ngx-translate/core";
import {DiscordComService} from "../../services/discord-com/discord-com.service";
import { HttpErrorResponse } from "@angular/common/http";
import {Guild} from "../../services/discord-com/types/Guilds";
import {nav_items, NavigationItem} from "../../services/types/navigation/NavigationItem";

@Component({
    selector: 'app-sidebar',
    imports: [
        FaIconComponent,
        NgOptimizedImage,
        RouterLink,
        NgClass,
        TranslatePipe
    ],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
    animations: [
        trigger('expandCollapse', [
            state('collapsed', style({
                height: '86px',
                overflow: 'hidden',
                opacity: 1
            })),
            state('expanded', style({
                height: '*',
                overflow: 'hidden',
                opacity: 1
            })),
            transition('expanded => collapsed', [
                style({ height: '*' }),
                animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ height: '86px' }))
            ]),
            transition('collapsed => expanded', [
                style({ height: '86px' }),
                animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ height: '*' }))
            ])
        ]),
        trigger('rotateChevron', [
            state('down', style({ transform: 'rotate(0deg)' })),
            state('down', style({ transform: 'rotate(90deg)' })),
            transition('right <=> down', [
                animate('300ms ease-in-out')
            ])
        ]),
        trigger('slideAnimation', [
            state('hidden', style({
                transform: 'translateX(-100%)',
                opacity: 0
            })),
            state('visible', style({
                transform: 'translateX(0)',
                opacity: 1
            })),
            transition('hidden => visible', [
                animate('0.3s ease-out')
            ]),
            transition('visible => hidden', [
                animate('0.3s ease-in')
            ])
        ]),
        trigger('slideInLeft', [
            transition(':enter', [
                style({ transform: 'translateX(-100%)' }),
                animate('300ms ease-out', style({ transform: 'translateX(0)' }))
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))
            ])
        ])
    ]
})
export class SidebarComponent implements AfterViewInit {
  protected readonly localStorage: Storage = localStorage;
  protected navigation: NavigationItem[] = nav_items;
  protected servers: Guild[] = [];

  @ViewChild('discordServerPicker') private server_picker!: ElementRef<HTMLDivElement>;

  protected readonly window: Window = window;
  protected expandedGroups: { [key: string]: boolean } = {};
  protected readonly faChevronRight: IconDefinition = faChevronRight;

  constructor(protected authService: AuthService, protected dataService: DataHolderService,
              private discordService: DiscordComService, private router: Router) {
    // initialize navigation pages to allow expanding/collapsing & automatically expand group if current page is in that group
    this.navigation.forEach(group => {
      this.expandedGroups[group.category] = group.pages.some(page =>
        window.location.href.endsWith(page.redirect_url)
      );
    });
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * Sets up a MutationObserver to monitor changes to the `discordServerPicker` element's style attribute.
   * When the element becomes visible (width > 0), it triggers the `getGuilds` method.
   */
  ngAfterViewInit(): void {
    const observer = new MutationObserver((): void => {
      if (this.server_picker.nativeElement.style.width > '0' || this.server_picker.nativeElement.style.width === '') {
        // call getGuilds() when server picker is visible only
        this.getGuilds();
      }
    });

    observer.observe(this.server_picker.nativeElement, { attributes: true, attributeFilter: ['style'] });

    // first time call
    setTimeout((): void => {
      if (this.server_picker.nativeElement.style.width === '') { this.getGuilds(); }
    }, 25);
  }

  /**
   * Toggles the expansion state of a navigation group.
   *
   * @param category - The category of the navigation group to toggle.
   */
  toggleGroup(category: string): void {
    this.expandedGroups[category] = !this.expandedGroups[category];
  }

  /**
   * Selects a server (guild) and updates the active guild in the data service.
   *
   * If the selected guild is already the active guild, it will be deselected and removed from local storage.
   * Otherwise, the selected guild will be set as the active guild and stored in local storage.
   *
   * @param {Guild} guild - The guild to select or deselect.
   */
  selectServer(guild: Guild): void {
    if (this.dataService.active_guild && this.dataService.active_guild.id === guild.id && !window.location.href.includes("/dashboard/contact")) {
      localStorage.removeItem('active_guild');
      this.dataService.active_guild = null;

    } else {
      localStorage.setItem('active_guild', JSON.stringify(guild));
      this.dataService.active_guild = guild;

      if (!this.server_picker) return;

      if (window.innerWidth > 1025) {
        // hide server picker on desktop
        this.server_picker.nativeElement.style.width = '0';
      } else {
        // hide mobile menu
        this.dataService.showMobileSidebar = false;
      }

      this.dataService.allowDataFetch.next(true);
      this.dataService.showSidebarLogo = !this.dataService.showSidebarLogo;
      this.dataService.showMobileSidebar = false;

      // redirect to server's dashboard if contact page is open
      if (window.location.href.includes("/dashboard/contact")) {
        this.router.navigateByUrl('/dashboard').then();
      }
    }
  }

  /**
   * Fetches the list of guilds (servers) from the Discord API and updates the local storage.
   *
   * If the guilds are already stored in local storage and were updated within the last 10 minutes,
   * the cached guilds are used instead of making a new API request.
   *
   * The function filters the guilds to include only those where the user has administrator permissions
   * or is the owner, and the guild has the "COMMUNITY" feature. It also formats the member and presence
   * counts for display and sorts the guilds by name.
   *
   * If the API request fails, the user is redirected to the login error page.
   */
  getGuilds(): void {
    // check if guilds are already stored in local storage
    if (localStorage.getItem('guilds') && localStorage.getItem('guilds_last_updated') &&
        Date.now() - Number(localStorage.getItem('guilds_last_updated')) < 600000) {
      this.servers = JSON.parse(localStorage.getItem('guilds') as string);
      if (!this.dataService.active_guild) { this.dataService.isLoading = false; }
      return;
    }

    this.discordService.getGuilds().then((observable) => observable.subscribe({
      next: (Guilds: Guild[]): void => {
        this.servers = Guilds
          .filter((guild: Guild): boolean =>
            // check if user has admin perms and if guild is public
            (this.authService.isAdmin(guild.permissions) || guild.owner) && guild.features.includes("COMMUNITY"))
          .map((guild: Guild): Guild => {
            if (guild.icon !== null) {  // add image url if guild has an icon
              guild.image_url = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}${guild.icon.startsWith('a_') ? '.gif' : '.png'}`;
            }

            // format thousand approximate_member_count with dot
            guild.approximate_member_count = new Intl.NumberFormat('de-DE').format(Number(guild.approximate_member_count));
            guild.approximate_presence_count = new Intl.NumberFormat('de-DE').format(Number(guild.approximate_presence_count));

            return guild;
          }).sort((a: Guild, b: Guild): number => a.name.localeCompare(b.name));  // filter guilds based on name

        localStorage.setItem('guilds', JSON.stringify(this.servers));
        localStorage.setItem('guilds_last_updated', Date.now().toString());
        if (!this.dataService.active_guild) { this.dataService.isLoading = false; }
      },
      error: (err: HttpErrorResponse): void => {
        if (err.status === 429) {
          this.dataService.redirectLoginError('REQUESTS');
          // this.dataService.isLoading = false;
        } else if (err.status === 401) {
          // do nothing because header is weird af
        } else {
          this.dataService.redirectLoginError('EXPIRED');
          // this.dataService.isLoading = false;
        }
      }
    }));
  }

}
