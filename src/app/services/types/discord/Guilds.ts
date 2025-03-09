export interface Guild {
  id: string;
  name: string;
  icon: string;
  banner: string;
  features: string[];
  owner: boolean;
  permissions: string;
  approximate_member_count: number | string;
  approximate_presence_count: number | string;

  // properties added by us
  image_url?: string;
}

export interface TeamList {
  team_roles: Role[];
  other_roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  color: number; // integer representation of the hexadecimal color code
  hoist: boolean; // if this role is pinned in the user listing
  icon: string | null; // icon hash
  unicode_emoji: string | null; // unicode emoji
  position: number; // position of this role (roles with the same position are sorted by their IDs)
  permissions: string; // permission bit set
  managed: boolean; // whether this role is managed by an integration
  mentionable: boolean; // whether this role is mentionable
  tags: {
    bot_id: string | null; // the bot this role belongs to
    integration_id: string | null; // the integration this role belongs to
    premium_subscriber: boolean | null; // whether this is the guild's premium subscriber role
  };
  flags: number; // role flags

  // properties added by us
  support_level?: number;
}
