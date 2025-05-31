import {SupportTheme, TicketSnippet} from "./Tickets";
import {Role} from "./discord/Guilds";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {BlockedUser} from "./discord/User";

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
  type: 'SUPPORT_THEMES' | 'TEAMLIST' | 'SUPPORT_SNIPPETS' | 'BLOCKED_USERS';
  list_empty: string;
  dataLoading: boolean;

  columns: ColumnConfig[];
  rows: SupportTheme[] | Role[] | TicketSnippet[] | BlockedUser[];
  action_btn: ButtonConfig[];
  actions: Function[];
}
