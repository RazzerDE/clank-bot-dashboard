import {AvatarDecoration} from "./Misc";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  mfa_enabled: boolean;
  banner: string | null;
  accent_color: number | null;
  locale: string;
  flags: number;
  premium_type: number;
  public_flags: number;
  avatar_decoration_data: AvatarDecoration | null;
}

export interface BlockedUser {
  guild_id?: string;            // Only used for adding a blocked user, not for listing
  user: DiscordUser | null;     // can be null if user is not on the guild
  staff: DiscordUser | null;    // can be null if staff is not on the guild
  user_id: string;
  staff_id: string;
  reason: string;
  end_date: number | null;      // null if no end date is set (else timestamp)
}
