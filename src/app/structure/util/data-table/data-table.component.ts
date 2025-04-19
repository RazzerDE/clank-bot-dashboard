import {Component, Input} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TranslatePipe} from "@ngx-translate/core";
import {TableConfig} from "../../../services/types/Config";
import {DataHolderService} from "../../../services/data/data-holder.service";
import {SupportTheme} from "../../../services/types/Tickets";
import {Role} from "../../../services/types/discord/Guilds";
import {NgClass} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'data-table',
  imports: [
    FaIconComponent,
    TranslatePipe,
    NgClass
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  animations: [
    trigger('rowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class DataTableComponent {
    @Input() tconfig: TableConfig = {} as TableConfig;

    constructor(protected dataService: DataHolderService) {}

  /**
   * Type guard to check if the given object is of type `SupportTheme`.
   * This function ensures that the `roles` attribute exists, which is specific to `SupportTheme`.
   *
   * @param obj - The object to check, which can be of type `SupportTheme` or `Role`.
   * @returns `true` if the object is of type `SupportTheme`, otherwise `false`.
   */
  isSupportType(obj: SupportTheme | Role): obj is SupportTheme {
    return (obj as SupportTheme).roles !== undefined;
  }

  /**
   * Type guard to check if the given object is of type `Role`.
   * This function ensures that the `support_level` attribute exists, which is specific to `Role`.
   *
   * @param obj - The object to check, which can be of type `SupportTheme` or `Role`.
   * @returns `true` if the object is of type `Role`, otherwise `false`.
   */
  isRoleType(obj: SupportTheme | Role): obj is Role {
    return (obj as Role).support_level !== undefined;
  }
}
