export interface GlobalChatCustomizing {
  bot_name: null | string;
  bot_avatar: null | string;
  lock_reason: null | string;
  description: null | string;
}

export interface GlobalChatObject {
  guild_id: string;
  object_id: string;
  is_delete: boolean;
}

export interface GlobalChatConfigDetails {
  guild_id?: string;
  channel_id: string | null;
  message_count: number;
  invite: string | null;
  created_at: number;
  lock_reason: null | string;
  bot_name: null | string;
  bot_avatar_url: null | string;
}

export interface GlobalChatConfig {
  global_config: GlobalChatConfigDetails | null;
  channel_count: number;
  total_message_count: number;
  global_desc: null | string;

  // Pending properties
  global_chat_pending_id?: string | null;
  global_chat_pending_delete?: boolean;
}
