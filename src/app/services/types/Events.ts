import {Channel, Role} from "./discord/Guilds";

export interface GiveawaysRaw {
  giveaways: Giveaway[];
  has_vip: boolean;
}

export interface Giveaway {
  event_id?: string;                  // Unique identifier for the giveaway
  guild_id?: string;                  // Optional
  channel_id?: string | null;         // Optional
  message_id?: string;                // Optional

  creator_id: string;                 // creator of the giveaway
  creator_name: string;               // name of the creator
  creator_avatar: string;             // avatar of the creator
  creator_invalidImg?: boolean;       // Optional, indicates if the creator avatar is invalid
  gw_req: string | null;              // requirement for the giveaway
  end_date: Date | string;            // end date of the giveaway
  prize: string;                      // prize of the giveaway
  winner_count: number;               // number of winners
  participants?: number;              // number of participants in the giveaway
  start_date: Date | string | null;   // start date of the giveaway

  sponsor_id?: string;                // Optional, sponsor of the giveaway
  sponsor_name?: string;              // Optional, name of the sponsor
  sponsor_avatar?: string;            // Optional, avatar of the sponsor
  sponsor_invalidImg?: boolean;       // Optional, indicates if the sponsor avatar is invalid
}

export interface RoleEffect {
  guild_id: string;                   // ID of the guild
  role_id: string;                    // ID of the role
  category: 0 | 1 | 2 | 3 | 4 | 5;    // Category of the role effect
  // categories: 0 (Blacklisted), 1 (whitelist), 2 (bonus), 3 (win), 4 (mention) or 5 (manager)
}

export interface ChannelEffect {
  guild_id: string;                   // ID of the guild
  channel_id: string;                 // ID of the channel
  category: 0 | 6;                    // Category of the channel effect
  // categories: 0 (Blacklisted) or 6 (invite log channel)
}

export interface EventEffects {
  channel_effects: ChannelEffect[];   // List of channel effects
  role_effects: RoleEffect[];         // List of role effects
}

export interface EventEffectsRaw {
  guild_channels: Channel[];
  guild_roles: Role[];
  channel_effects: ChannelEffect[];
  role_effects: RoleEffect[];
}

export interface EventCard {
  id: number;
  title: string;
  description: string;
  obj_list: Role[] | Channel[];
  color: 'red' | 'green' | 'yellow' | 'blue' | 'gray' | 'purple' | 'orange' | 'rosa';
}

export const event_cards: EventCard[] = [
  {
    id: 0,
    title: 'EVENTS_TAB_BLACKLIST_TITLE',
    description: 'EVENTS_TAB_BLACKLIST_DESC',
    color: 'red',
    obj_list: []
  },
  {
    id: 1,
    title: 'EVENTS_TAB_WHITELIST_TITLE',
    description: 'EVENTS_TAB_WHITELIST_DESC',
    color: 'green',
    obj_list: []
  },
  {
    id: 2,
    title: 'EVENTS_TAB_BONUS_TITLE',
    description: 'EVENTS_TAB_BONUS_DESC',
    color: 'yellow',
    obj_list: []
  },
  {
    id: 3,
    title: 'EVENTS_TAB_WIN_TITLE',
    description: 'EVENTS_TAB_WIN_DESC',
    color: 'blue',
    obj_list: []
  },
  {
    id: 4,
    title: 'EVENTS_TAB_MENTION_TITLE',
    description: 'EVENTS_TAB_MENTION_DESC',
    color: 'gray',
    obj_list: []
  },
  {
    id: 5,
    title: 'EVENTS_TAB_MANAGER_TITLE',
    description: 'EVENTS_TAB_MANAGER_DESC',
    color: 'purple',
    obj_list: []
  },
  {
    id: 6,
    title: 'EVENTS_TAB_BLACKLIST_TITLE',
    description: 'EVENTS_TAB_BLACKLIST_CHANNEL_DESC',
    color: 'orange',
    obj_list: []
  },
  {
    id: 7,
    title: 'EVENTS_TAB_INVITE_TITLE',
    description: 'EVENTS_TAB_INVITE_DESC',
    color: 'rosa',
    obj_list: []
  }
]
