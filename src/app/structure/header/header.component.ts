import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {LangSwitchButtonComponent} from "../util/lang-switch-button/lang-switch-button.component";
import {ThemeSwitchButtonComponent} from "../util/theme-switch-button/theme-switch-button.component";
import {DataHolderService} from "../../services/data/data-holder.service";
import {TranslatePipe} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";
import {animate, style, transition, trigger} from "@angular/animations";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faHouse} from "@fortawesome/free-solid-svg-icons";
import {RouterLink} from "@angular/router";

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
export class HeaderComponent implements OnInit {
  @ViewChild('Header') protected header!: ElementRef<HTMLDivElement>;
  @ViewChild('searchContainer') protected searchContainer!: ElementRef<HTMLDivElement>;

  private server_picker_width: number = 0;
  protected showSearchInput: boolean = false;
  protected searchInput: string = '';

  constructor(private dataService: DataHolderService) {}

  /**
   * Angular lifecycle hook that is called after the component's view has been fully initialized.
   * This method sets the width of the search input container to match the width of the header.
   */
  ngOnInit(): void {
    this.setSearchInputWidth();
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
   * Sets the width of the search input container to match the width of the header.
   * This function is triggered on window resize events.
   *
   */
  @HostListener('window:resize', ['$event'])
  @HostListener('document:fullscreenchange', ['$event'])
  setSearchInputWidth(): void {
    this.searchContainer.nativeElement.style.width = `${this.header.nativeElement.offsetWidth}px`;
  }



  protected readonly faHouse = faHouse;
}
