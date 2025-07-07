import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {TableConfig} from "../../../services/types/Config";
import {DataHolderService} from "../../../services/data/data-holder.service";
import {SupportTheme, TicketSnippet} from "../../../services/types/Tickets";
import {Role} from "../../../services/types/discord/Guilds";
import {NgClass, NgOptimizedImage, NgStyle} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";
import {faClock, faRobot, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faHourglassEnd} from "@fortawesome/free-solid-svg-icons/faHourglassEnd";
import {BlockedUser} from "../../../services/types/discord/User";
import {DatePipe} from "../../../pipes/date/date.pipe";
import {Giveaway} from "../../../services/types/Events";
import {MarkdownPipe} from "../../../pipes/markdown/markdown.pipe";
import {faChartSimple} from "@fortawesome/free-solid-svg-icons/faChartSimple";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {ConvertTimePipe} from "../../../pipes/convert-time.pipe";

@Component({
  selector: 'data-table',
  imports: [
    FaIconComponent,
    TranslatePipe,
    NgClass,
    NgOptimizedImage,
    NgStyle,
    DatePipe,
    NgbTooltip,
    MarkdownPipe,
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
export class DataTableComponent implements AfterViewInit {
    @Input() tconfig: TableConfig = {} as TableConfig;
    @Output() rowClick = new EventEmitter<any>();
    @ViewChild('mainRow') protected mainRow!: ElementRef<HTMLTableCellElement>;
    protected markdownPipe: MarkdownPipe = new MarkdownPipe();
    private convertTimePipe: ConvertTimePipe = new ConvertTimePipe();

    protected now: Date = new Date();
    protected rowHeight: number = 0;
    protected readonly faClock: IconDefinition = faClock;
    protected readonly faRobot: IconDefinition = faRobot;
    protected readonly faChartSimple: IconDefinition = faChartSimple;
    protected readonly faHourglassEnd: IconDefinition = faHourglassEnd;

    constructor(protected dataService: DataHolderService, protected translate: TranslateService) {}

    /**
     * Lifecycle hook that is called after the component's view has been fully initialized.
     * This method calculates the height of the main row element and assigns it to the `rowHeight` property.
     * A `setTimeout` is used to ensure the DOM is fully rendered before accessing the element's height.
     */
    ngAfterViewInit(): void {
      setTimeout((): void => {
        if (this.mainRow && this.mainRow.nativeElement) {
          this.rowHeight = this.mainRow.nativeElement.clientHeight;
        }
      }, 100);
    }

  /**
   * Handles the click event on a table row.
   * Emits the clicked row object through the `rowClick` event emitter.
   *
   * @param row - The row object that was clicked, which can be of type `SupportTheme`, `Role`, or `TicketSnippet`.
   */
    onRowClick(row: SupportTheme | Role | TicketSnippet | BlockedUser | Giveaway): void {
      this.rowClick.emit(row);
    }

    /**
     * Type guard to check if the given object is of type `SupportTheme`.
     * This function ensures that the `roles` attribute exists, which is specific to `SupportTheme`.
     *
     * @param obj - The object to check, which can be of type `SupportTheme` or `Role`.
     * @returns `true` if the object is of type `SupportTheme`, otherwise `false`.
     */
    isSupportType(obj: SupportTheme | Role | TicketSnippet | BlockedUser | Giveaway): obj is SupportTheme {
      return (obj as SupportTheme).roles !== undefined;
    }

    /**
     * Type guard to check if the given object is of type `Role`.
     * This function ensures that the `support_level` attribute exists, which is specific to `Role`.
     *
     * @param obj - The object to check, which can be of type `SupportTheme` or `Role`.
     * @returns `true` if the object is of type `Role`, otherwise `false`.
     */
    isRoleType(obj: SupportTheme | Role | TicketSnippet | BlockedUser | Giveaway): obj is Role {
      return (obj as Role).support_level !== undefined;
    }

    /**
     * Type guard to check if the given object is of type `BlockedUser`.
     * This function ensures that the `staff_id` attribute exists, which is specific to `BlockedUser`.
     *
     * @param obj - The object to check.
     * @returns `true` if the object is of type `BlockedUser`, otherwise `false`.
     */
    isBlockedUserType(obj: SupportTheme | Role | TicketSnippet | BlockedUser | Giveaway): obj is BlockedUser {
      return (obj as BlockedUser).staff_id !== undefined && (obj as BlockedUser).reason !== undefined;
    }

    /**
     * Type guard to check if the given object is of type `Giveaway`.
     * This function ensures that the `creator_id` and `prize` attributes exist, which are specific to `Giveaway`.
     *
     * @param obj - The object to check, which can be of type `SupportTheme`, `Role`, `TicketSnippet`, `BlockedUser`, or `Giveaway`.
     * @returns `true` if the object is of type `Giveaway`, otherwise `false`.
     */
    isGiveawayType(obj: SupportTheme | Role | TicketSnippet | BlockedUser | Giveaway): obj is Giveaway {
      return (obj as Giveaway).creator_id !== undefined && (obj as Giveaway).prize !== undefined;
    }

  /**
   * Formats a giveaway requirement string into a user-friendly format.
   * It checks the prefix of the requirement string and applies the corresponding transformation
   * from the `giveawayMappings` object. If no mapping is found, it returns the original string.
   * Special handling is applied for the "no_nitro" requirement.
   *
   * @param gw_req - The giveaway requirement string to format, or `null`.
   * @param index - The index of the requirement - is used for role requirements to apply styles.
   * @returns The formatted requirement string, or `null` if the input is `null`.
   */
    protected formatGiveawayRequirement(gw_req: string | null, index: number): string | null {
      if (!gw_req) return gw_req;

      for (const prefix in this.giveawayMappings) {
        if (gw_req.startsWith(prefix)) {
          return this.giveawayMappings[prefix](gw_req, index);
        }
      }

      if (gw_req === 'no_nitro') { return this.translate.instant('PLACEHOLDER_EVENT_REQ_NO_NITRO'); }
      return gw_req;
    }

    /**
     * Generates CSS styles for a Discord role for a support-theme based on its color.
     * Converts the role's decimal color value to a hex color string and creates a style object
     * with background color (10% opacity), text color, and border color matching the role's color.
     *
     * @param role - The Discord role object containing a color property
     * @returns An object with CSS style properties as key-value pairs
     */
    getRoleStyles(role: Role): { [key: string]: string } {
      if (!role.color) {
        return { // default color
          'background-color': 'rgba(115, 115, 115, 0.1)',
          'color': '#737373',
          'border-color': '#737373',
          'border-width': '1px'
        };
      }
      const hexColor: string = role.color.toString(16).padStart(6, '0');
      const r: number = parseInt(hexColor.substring(0, 2), 16);
      const g: number = parseInt(hexColor.substring(2, 4), 16);
      const b: number = parseInt(hexColor.substring(4, 6), 16);

      return {
        'background-color': `rgba(${r}, ${g}, ${b}, 0.1)`,
        'color': `#${hexColor}`,
        'border-color': `#${hexColor}`,
        'border-width': '1px'
      };
    }

    /**
     * A mapping of giveaway requirement prefixes to their corresponding transformation functions.
     * Each function takes the requirement string as input and returns a formatted string.
     */
    private giveawayMappings: { [key: string]: (value: string, index: number) => string } = {
      'OWN: ': (value) => this.markdownPipe.transform(value.replace('OWN: ', '💡 ~ ')),
      'MSG: ': (value) => {
        const msg_count = parseInt(value.replace('MSG: ', ''));
        return this.translate.instant('PLACEHOLDER_EVENT_REQ_MSG', { count: msg_count });
      },
      'VOICE: ': (value) => {
        const voice_count = parseInt(value.replace('VOICE: ', ''));
        return this.translate.instant('PLACEHOLDER_EVENT_REQ_VOICE', {
          voicetime: this.convertTimePipe.transform(voice_count, this.translate.currentLang),
        });
      },
      'MITGLIED: ': (value) => {
        const membership_seconds = parseInt(value.replace('MITGLIED: ', ''));
        return this.translate.instant('PLACEHOLDER_EVENT_REQ_MEMBER', {
          membership: this.convertTimePipe.transform(membership_seconds, this.translate.currentLang),
        });
      },
      'ROLE_ID: ': (value, index) => {
        const [role_id, role_name, role_color] = value.replace('ROLE_ID: ', '').split(' - ');
        const roleElement: HTMLSpanElement = document.getElementById(`gw_req_${index}`) as HTMLSpanElement;
        if (roleElement && roleElement.children.length > 0) {
          (roleElement.children[0] as HTMLSpanElement).style.color = `${role_color}`;
        }

        return this.translate.instant('PLACEHOLDER_EVENT_REQ_ROLE', { role_id, role_name });
      },
      'SERVER: ': (value) => {
        if (value.replace('SERVER: ', '').startsWith('https://discord.gg/')) {
          const [invite, guild_name] = value.replace('SERVER: ', '').split(' - ');
          return this.translate.instant('PLACEHOLDER_EVENT_REQ_SERVER', { invite, guild_name });
        }
        return value;
      },
    };

  /**
   * Determines if a button should be disabled for a giveaway based on its index and the giveaway's state.
   *
   * Button indexes:
   * - 0: Play button (disabled for running giveaways)
   * - 1: Edit button (disabled for scheduled/pending giveaways)
   * - 2: Delete button (disabled for running giveaways)
   * - 3: Stop button (disabled for scheduled/pending giveaways)
   *
   * Cases:
   * - Running giveaways (without `start_date`): Disable Play/Delete buttons (index 0,2)
   * - Scheduled giveaways (with `start_date`): Disable Edit/Stop buttons (index 1,3)
   * - Ended giveaways (where `end_date` is in the past): Disable all buttons
   * - Giveaways that have not started yet (with `start_date` in the future): Disable Play/Edit buttons (index 0,1)
   *
   * @param obj - The giveaway object to check
   * @param index - The button index (0-3)
   * @returns `true` if the button should be disabled, otherwise `false`
   */
  isInvalidButtonForIndex(obj: Giveaway, index: number) {
    return (obj.start_date && (index === 0 || index === 2) || (!obj.start_date && (index === 1 || index === 3))) ||
    (!obj.start_date && obj.end_date && this.now.getTime() > new Date(obj.end_date).getTime()) ||
    (obj.start_date && this.now.getTime() > new Date(obj.start_date).getTime());
  }
}
