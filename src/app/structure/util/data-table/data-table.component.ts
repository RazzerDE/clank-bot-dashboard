import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TranslatePipe} from "@ngx-translate/core";
import {TableConfig} from "../../../services/types/Config";
import {DataHolderService} from "../../../services/data/data-holder.service";
import {SupportTheme} from "../../../services/types/Tickets";
import {Role} from "../../../services/types/discord/Guilds";
import {NgClass, NgOptimizedImage, NgStyle} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";
import {faRobot, IconDefinition} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'data-table',
  imports: [
    FaIconComponent,
    TranslatePipe,
    NgClass,
    NgOptimizedImage,
    NgStyle
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
    @ViewChild('mainRow') protected mainRow!: ElementRef<HTMLTableCellElement>;

    protected rowHeight: number = 0;
    protected readonly faRobot: IconDefinition = faRobot;

    constructor(protected dataService: DataHolderService) {}

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

    /**
     * Generates CSS styles for a Discord role for a support-theme based on its color.
     * Converts the role's decimal color value to a hex color string and creates a style object
     * with background color (10% opacity), text color, and border color matching the role's color.
     *
     * @param role - The Discord role object containing a color property
     * @returns An object with CSS style properties as key-value pairs
     */
    getRoleStyles(role: Role): { [key: string]: string } {
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
     * Extracts the emoji ID from a Discord emoji string and returns the corresponding CDN URL.
     * Discord emojis are formatted as `<:name:id>` for standard emojis or `<a:name:id>` for animated emojis.
     *
     * @param emoji - The Discord emoji string format (e.g., '<:emojiname:123456789>' or '<a:emojiname:123456789>')
     * @returns The CDN URL for the emoji, or an empty string if the emoji format is invalid
     */
    getEmojibyId(emoji: string): string {
      // Match emoji format <:name:id> or <a:name:id>
      const match = emoji.match(/<(a?):(\w+):(\d+)>/);
      if (!match) return emoji;

      const isAnimated = match[1] === 'a';
      const emojiId = match[3];

      return `https://cdn.discordapp.com/emojis/${emojiId}${isAnimated ? '.gif' : '.png'}`;
    }
}
