import {Role} from "./discord/Guilds";

export interface TicketAnnouncement {
  level: number | null;
  description: string | null;
  end_date: number | string | null; // unix timestamp
}

export interface TicketSnippet {
  guild_id?: string;
  old_name?: string; // used for updating snippets
  name: string;
  desc: string;
}

export interface SupportTheme {
  id: string;
  name: string;
  icon: string;
  roles: Role[];
  faq_answer: string | null;
  desc: string;

  // added by us
  has_perms?: boolean;
  default_roles?: Role[];
  guild_id?: string;
  pending?: boolean; // change is pending
  action?: 'CREATE' | 'UPDATE' | 'DELETE'; // action to perform
  old_name?: string; // new name for the theme (only for UPDATE)
}

export interface SupportThemeResponse {
  themes: SupportTheme[];
  guild_roles: Role[];
  has_vip: boolean;
}
