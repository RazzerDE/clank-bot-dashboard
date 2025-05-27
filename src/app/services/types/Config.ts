import {SupportTheme, TicketSnippet} from "./Tickets";
import {Role} from "./discord/Guilds";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";

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
  type: 'SUPPORT_THEMES' | 'TEAMLIST' | 'SUPPORT_SNIPPETS';
  list_empty: string;
  dataLoading: boolean;

  columns: ColumnConfig[];
  rows: SupportTheme[] | Role[] | TicketSnippet[];
  action_btn: ButtonConfig[];
  actions: Function[];
}
