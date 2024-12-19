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
