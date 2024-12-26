import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {LangSwitchButtonComponent} from "../util/lang-switch-button/lang-switch-button.component";
import {ThemeSwitchButtonComponent} from "../util/theme-switch-button/theme-switch-button.component";
import {DataHolderService} from "../../services/data/data-holder.service";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";
import {animate, style, transition, trigger} from "@angular/animations";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {RouterLink} from "@angular/router";
import {FilteredNavigationItem, nav_items, NavigationItem} from "../sidebar/types/NavigationItem";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgOptimizedImage,
    LangSwitchButtonComponent,
    ThemeSwitchButtonComponent,
    NgClass,
    TranslatePipe,
    FormsModule,
    FaIconComponent,
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ transform: 'translateY(-24px)', opacity: 0 }), // Start from top of border
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(-24px)', opacity: 0 }))
      ])
    ]),
    trigger('searchAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('300ms ease-out')
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(-100%)' }))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('Header') protected header!: ElementRef<HTMLDivElement>;
  @ViewChild('searchContainer') protected searchContainer!: ElementRef<HTMLDivElement>;

  protected navigation: NavigationItem[] = nav_items;
  protected filteredNavItems: NavigationItem[] = nav_items;

  private langSubscription!: Subscription;
  private server_picker_width: number = 0;
  protected showSearchInput: boolean = false;
  protected searchInput: string = '';

  constructor(private dataService: DataHolderService, private translate: TranslateService) {}

  /**
   * Angular lifecycle hook that is called after the component's view has been fully initialized.
   * This method sets the width of the search input container to match the width of the header.
   * Also, it translates the navigation items and stores them in the translatedNavItems array for search purposes.
   */
  ngOnInit(): void {
    this.setSearchInputWidth();
    this.translateNavItems();
  }

  /**
   * Angular lifecycle hook that is called when the component is destroyed.
   * This method unsubscribes from the language change subscription to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  /**
   * Toggles the visibility of the server picker sidebar.
   * If the sidebar is currently hidden (width is 0), it will be shown.
   * If the sidebar is currently visible, it will be hidden (width set to 0).
   */
  toggleServers(): void {
    const element: HTMLDivElement | null = document.getElementById('discord-server-picker') as HTMLDivElement;
    if (element) {
      if (this.server_picker_width === 0) {
        this.server_picker_width = element.clientWidth;
      }

      // show it again
      if (element.style.width === '0px') {
        element.style.width = this.server_picker_width + 'px';
      } else {
        // hide it
        element.style.width = '0';
      }

      this.dataService.showSidebarLogo = !this.dataService.showSidebarLogo;
    }
  }

  /**
   * Translates the navigation items and stores them in the translatedNavItems array for search purposes.
   * This method subscribes to the onLangChange event of the TranslateService to update the translatedNavItems array
   * whenever the language changes.
   */
  translateNavItems(): void {
    this.langSubscription = this.translate.onLangChange.subscribe((): void => {
      // reload the navigation items with the new translations
      this.navigation = nav_items.map(item => ({
        ...item,
        category: this.translate.instant(item.category),
        description: this.translate.instant(item.description),
        pages: item.pages.map(page => ({
          ...page,
          title: this.translate.instant(page.title),
          desc: this.translate.instant(page.desc)
        }))
      }));

      // update the filtered navigation items
      this.filteredNavItems = this.navigation;
      if (this.searchInput) {
        this.getFilteredResults();
      }
    });
  }

  /**
   * Closes the search input - it is used to fix a animation jump when the search input is closed, but results are shown.
   *
   * If there is any text in the search input, it clears the input and then hides the search input after a delay.
   * If the search input is already empty, it hides the search input immediately.
   */
  closeSearch(): void {
    if (this.searchInput) {
      this.searchInput = '';
      setTimeout((): void => { this.showSearchInput = false; }, 300);
    } else {
      this.showSearchInput = false;
    }
  }

  /**
   * Filters the navigation items based on the search input and returns the filtered results.
   * The search term is converted to lowercase and compared against the category,
   * description, title, and redirect URL of each navigation item and its pages.
   * The filtered results are stored in the `filteredNavItems` array.
   *
   * @returns {FilteredNavigationItem[]} An array of filtered navigation items with matching pages.
   */
  getFilteredResults(): FilteredNavigationItem[] {
    const searchTerm: string = this.searchInput.toLowerCase();
    return this.filteredNavItems
      .map(item => {
        const isCategoryMatch: boolean = item.category.toLowerCase().includes(searchTerm);
        return {
          ...item,
          showPages: isCategoryMatch ? item.pages : item.pages.filter(page =>
            page.title.toLowerCase().includes(searchTerm) ||
            page.desc.toLowerCase().includes(searchTerm) ||
            page.redirect_url.toLowerCase().includes(searchTerm)
          )
        };
      })
      .filter(item => item.showPages.length > 0);
  }

  /**
   * Sets the width of the search input container to match the width of the header.
   * This function is triggered on window resize events.
   *
   */
  @HostListener('window:resize', ['$event'])
  @HostListener('document:fullscreenchange', ['$event'])
  setSearchInputWidth(): void {
    if (this.searchContainer && this.header) {
      this.searchContainer.nativeElement.style.width = `${this.header.nativeElement.offsetWidth}px`;
    }
  }

}
