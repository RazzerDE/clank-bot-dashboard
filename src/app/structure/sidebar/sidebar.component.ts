import { Component } from '@angular/core';
import {faChevronRight} from "@fortawesome/free-solid-svg-icons/faChevronRight";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {AuthService} from "../../services/auth/auth.service";
import {DataHolderService} from "../../services/data/data-holder.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {nav_items, NavigationItem} from "./types/NavigationItem";
import {Server, servers} from "./types/Servers";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-sidebar',
  standalone: true,
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
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ height: '86px' })
        )
      ]),
      transition('collapsed => expanded', [
        style({ height: '86px' }),
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
    ])
  ]
})
export class SidebarComponent {
  protected navigation: NavigationItem[] = nav_items;
  protected servers: Server[] = servers;

  protected expandedGroups: { [key: string]: boolean } = {};
  protected readonly faChevronRight: IconDefinition = faChevronRight;

  constructor(protected authService: AuthService, protected dataService: DataHolderService) {
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

  protected readonly localStorage = localStorage;
}
