export interface Giveaway {
  event_id?: string;                        // Unique identifier for the giveaway
  guild_id?: string;                  // Optional
  channel_id?: string | null;         // Optional
  message_id?: string;                // Optional

  creator_id: string;                 // creator of the giveaway
  creator_name: string;               // name of the creator
  creator_avatar: string;             // avatar of the creator
  gw_req: string | null;              // requirement for the giveaway
  end_date: Date | string;            // end date of the giveaway
  prize: string;                      // prize of the giveaway
  winner_count: number;               // number of winners
  participants?: number;              // number of participants in the giveaway
  start_date: Date | string | null;   // start date of the giveaway

  sponsor_id?: string;                // Optional, sponsor of the giveaway
  sponsor_name?: string;              // Optional, name of the sponsor
  sponsor_avatar?: string;            // Optional, avatar of the sponsor
}
