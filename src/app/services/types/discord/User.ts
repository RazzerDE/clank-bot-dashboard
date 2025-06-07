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
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  staff_id: string;
  staff_name: string;
  staff_avatar: string | null;
  reason: string;
  end_date: number | string | null;      // null if no end date is set (else timestamp)
}
