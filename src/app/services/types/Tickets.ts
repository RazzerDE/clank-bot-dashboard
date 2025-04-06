import {DiscordUser} from "./discord/User";

export interface Ticket {
  id: string;
  title: string;
  status: 0 | 1 | 2; // 0: open, 1: claimed, 2: closed
  creator: DiscordUser;
  tag: string;
  creation_date: Date;
}
