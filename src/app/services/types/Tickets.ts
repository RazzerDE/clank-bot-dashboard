import {DiscordUser} from "./discord/User";
import {Role} from "./discord/Guilds";

export interface Ticket {
  id: string;
  title: string;
  status: 0 | 1 | 2; // 0: open, 1: claimed, 2: closed
  creator: DiscordUser;
  tag: string;
  creation_date: Date;
}

export interface SupportTheme {
  id: string;
  name: string;
  icon: string;
  roles: Role[];
  faq_answer: string | null;
  desc: string;
}
