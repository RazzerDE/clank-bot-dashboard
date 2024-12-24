import { Component } from '@angular/core';
import {faChevronRight} from "@fortawesome/free-solid-svg-icons/faChevronRight";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {AuthService} from "../../services/auth/auth.service";
import {DataHolderService} from "../../services/data/data-holder.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {nav_items, NavigationItem} from "./types/NavigationItem";

@Component({
  selector: 'app-sidebar',
  standalone: true,
    imports: [
        FaIconComponent,
        NgOptimizedImage,
        RouterLink
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
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ height: '96px' })
        )
      ]),
      transition('collapsed => expanded', [
        style({ height: '96px' }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ height: '*' })
        )
      ])
    ]),
    trigger('rotateChevron', [
      state('down', style({ transform: 'rotate(0deg)' })),
      state('down', style({ transform: 'rotate(90deg)' })),
      transition('right <=> down', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class SidebarComponent {
  protected navigation: NavigationItem[] = nav_items;
  protected expandedGroups: { [key: string]: boolean } = {};
  protected readonly faChevronRight: IconDefinition = faChevronRight;

  constructor(protected authService: AuthService, private dataService: DataHolderService) {
    // initialize navigation pages to allow expanding/collapsing
    this.navigation.forEach(group => {
      this.expandedGroups[group.category] = false;
      this.dataService.isLoading = false;
    });
  }

  /**
   * Toggles the expansion state of a navigation group.
   *
   * @param category - The category of the navigation group to toggle.
   */
  toggleGroup(category: string) {
    this.expandedGroups[category] = !this.expandedGroups[category];
  }
}
