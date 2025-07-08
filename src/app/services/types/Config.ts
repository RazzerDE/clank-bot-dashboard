import {SupportTheme, TicketSnippet} from "./Tickets";
import {Role} from "./discord/Guilds";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {BlockedUser} from "./discord/User";
import {Giveaway} from "./Events";

export interface SelectItems {
  value: string;
  label: string;
}

export interface ColumnConfig {
  width: number; // Width of the column header in %
  name: string;
}

export interface ButtonConfig {
  color: string;
  icon: IconDefinition;
  size: 'lg' | 'xl';
  action: Function;
}

export interface TableConfig {
  type: 'SUPPORT_THEMES' | 'TEAMLIST' | 'SUPPORT_SNIPPETS' | 'BLOCKED_USERS' | 'EVENTS_VIEW';
  list_empty: string;
  dataLoading: boolean;

  columns: ColumnConfig[];
  rows: SupportTheme[] | Role[] | TicketSnippet[] | BlockedUser[] | Giveaway[];
  action_btn: ButtonConfig[];
  actions: Function[];
}

export interface EmbedConfig {
  color_code: string | number | null;       // Hex color code
  thumbnail_url: string | null;             // URL to the thumbnail image
  banner_url: string | null;                // URL to the banner image, can be null
  emoji_reaction: string | null;            // Emoji to be displayed, e.g., '<a:present:873708141085343764>'

  thumbnail_invalid?: boolean;              // Flag to indicate if the thumbnail is invalid
  banner_invalid?: boolean;                 // Flag to indicate if the banner is invalid
}
