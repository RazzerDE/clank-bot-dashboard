import {Channel, Role} from "./discord/Guilds";

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


export interface EventCard {
  title: string;
  description: string;
  obj_list: Role[] | Channel[];
  color: 'red' | 'green' | 'yellow' | 'blue' | 'gray' | 'purple' | 'orange' | 'rosa';
}

export const event_cards: EventCard[] = [
  {
    title: 'EVENTS_TAB_BLACKLIST_TITLE',
    description: 'EVENTS_TAB_BLACKLIST_DESC',
    color: 'red',
    obj_list: [
      {
        id: '987654321098765432',
        name: 'Banned Users',
        color: 16711680, // Entspricht #FF0000 (Rot)
        hoist: true,
        icon: null,
        unicode_emoji: '⛔',
        position: 5,
        permissions: '0',
        managed: false,
        mentionable: true,
        tags: { bot_id: null, integration_id: null, premium_subscriber: null },
        flags: 0
      },
      {
        id: '876543210987654321',
        name: 'Restricted',
        color: 10038562, // Entspricht #992222 (Dunkelrot)
        hoist: true,
        icon: null,
        unicode_emoji: '🚫',
        position: 4,
        permissions: '0',
        managed: false,
        mentionable: true,
        tags: { bot_id: null, integration_id: null, premium_subscriber: null },
        flags: 0
      }
    ]
  },
  {
    title: 'EVENTS_TAB_WHITELIST_TITLE',
    description: 'EVENTS_TAB_WHITELIST_DESC',
    color: 'green',
    obj_list: [
      {
        id: '765432109876543210',
        name: 'VIP',
        color: 65280, // Entspricht #00FF00 (Grün)
        hoist: true,
        icon: null,
        unicode_emoji: '✅',
        position: 10,
        permissions: '8',
        managed: false,
        mentionable: true,
        tags: { bot_id: null, integration_id: null, premium_subscriber: null },
        flags: 0,
        support_level: 3
      }
    ]
  },
  {
    title: 'EVENTS_TAB_BONUS_TITLE',
    description: 'EVENTS_TAB_BONUS_DESC',
    color: 'yellow',
    obj_list: [
      {
        id: '654321098765432109',
        name: 'Premium User',
        color: 16776960, // Entspricht #FFFF00 (Gelb)
        hoist: true,
        icon: null,
        unicode_emoji: '⭐',
        position: 8,
        permissions: '0',
        managed: false,
        mentionable: true,
        tags: { bot_id: null, integration_id: null, premium_subscriber: true },
        flags: 0,
        support_level: 2
      },
      {
        id: '543210987654321098',
        name: 'Event Booster',
        color: 16750848, // Entspricht #FFD700 (Goldgelb)
        hoist: true,
        icon: null,
        unicode_emoji: '🎁',
        position: 7,
        permissions: '0',
        managed: false,
        mentionable: true,
        tags: { bot_id: null, integration_id: null, premium_subscriber: null },
        flags: 0,
        support_level: 1
      },
      {
        id: '432109876543210987',
        name: 'Lucky Charm',
        color: 15844367, // Entspricht #F1C40F (Orangegelb)
        hoist: false,
        icon: null,
        unicode_emoji: '🍀',
        position: 6,
        permissions: '0',
        managed: false,
        mentionable: true,
        tags: { bot_id: null, integration_id: null, premium_subscriber: null },
        flags: 0
      }
    ]
  },
  {
    title: 'EVENTS_TAB_WIN_TITLE',
    description: 'EVENTS_TAB_WIN_DESC',
    color: 'blue',
    obj_list: [
      {
        id: '321098765432109876',
        name: 'Winner',
        color: 255, // Entspricht #0000FF (Blau)
        hoist: true,
        icon: null,
        unicode_emoji: '🏆',
        position: 9,
        permissions: '0',
        managed: false,
        mentionable: true,
        tags: { bot_id: null, integration_id: null, premium_subscriber: null },
        flags: 0
      }
    ]
  },
  {
    title: 'EVENTS_TAB_MENTION_TITLE',
    description: 'EVENTS_TAB_MENTION_DESC',
    color: 'gray',
    obj_list: [
      {
        id: '210987654321098765',
        name: 'Notification Squad',
        color: 10066329, // Entspricht #999999 (Grau)
        hoist: false,
        icon: null,
        unicode_emoji: '🔔',
        position: 3,
        permissions: '0',
        managed: false,
        mentionable: true,
        tags: { bot_id: null, integration_id: null, premium_subscriber: null },
        flags: 0
      },
      {
        id: '109876543210987654',
        name: 'Event Updates',
        color: 7697781, // Entspricht #757575 (Dunkelgrau)
        hoist: false,
        icon: null,
        unicode_emoji: '📢',
        position: 2,
        permissions: '0',
        managed: false,
        mentionable: true,
        tags: { bot_id: null, integration_id: null, premium_subscriber: null },
        flags: 0
      }
    ]
  },
  {
    title: 'EVENTS_TAB_MANAGER_TITLE',
    description: 'EVENTS_TAB_MANAGER_DESC',
    color: 'purple',
    obj_list: [
      {
        id: '098765432109876543',
        name: 'Event Manager',
        color: 10181046, // Entspricht #9B59B6 (Lila)
        hoist: true,
        icon: null,
        unicode_emoji: '🎭',
        position: 11,
        permissions: '8',
        managed: false,
        mentionable: true,
        tags: { bot_id: null, integration_id: null, premium_subscriber: null },
        flags: 0,
        support_level: 5
      },
      {
        id: '987654321098765432',
        name: 'Giveaway Mod',
        color: 8388736, // Entspricht #800080 (Dunkellila)
        hoist: true,
        icon: null,
        unicode_emoji: '🎮',
        position: 10,
        permissions: '4',
        managed: false,
        mentionable: true,
        tags: { bot_id: null, integration_id: null, premium_subscriber: null },
        flags: 0,
        support_level: 4
      }
    ]
  },
  {
    title: 'EVENTS_TAB_BLACKLIST_TITLE',
    description: 'EVENTS_TAB_BLACKLIST_CHANNEL_DESC',
    color: 'orange',
    obj_list: [
      {
        id: '123456789012345678',
        name: 'blacklist-logs',
        type: 0, // Textkanal
        position: 1,
        permission_overwrites: [],
        parent_id: null,
        nsfw: false
      },
      {
        id: '234567890123456789',
        name: 'banned-voice',
        type: 2, // Sprachkanal
        position: 2,
        permission_overwrites: [],
        parent_id: null,
        nsfw: false
      }
    ]
  },
  {
    title: 'EVENTS_TAB_INVITE_TITLE',
    description: 'EVENTS_TAB_INVITE_DESC',
    color: 'rosa',
    obj_list: [
      {
        id: '345678901234567890',
        name: 'invite-only',
        type: 0, // Textkanal
        position: 3,
        permission_overwrites: [],
        parent_id: null,
        nsfw: false
      },
      {
        id: '456789012345678901',
        name: 'vip-lounge',
        type: 2, // Sprachkanal
        position: 4,
        permission_overwrites: [],
        parent_id: null,
        nsfw: false
      }
    ]
  }
]
