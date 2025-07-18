import {Channel, Role} from "./discord/Guilds";

export interface UnbanRequest {
  guild_id?: string;                  // The ID of the guild where the unban request was made (only in POST requests).
  user_id: string;                    // The ID of the user who made the unban request.
  user_name: string;                  // The username of the user who made the unban request.
  user_avatar: string;                // The avatar URL of the user who made the unban request.
  staff_id: string;                   // The ID of the staff member who processed the request (only in POST requests).
  staff_name: string;                 // The name of the staff member who processed the request (only in POST requests).
  staff_avatar: string;               // The avatar URL of the staff member who processed the request (only in POST requests).
  end_date: number | string | null;   // null if no end date is set (else timestamp)
  ban_reason: string;                 // The reason for the ban that the user is requesting to be lifted.
  excuse: string;                     // The excuse provided by the user for the unban request.
  updated_date: number | string;      // The date when the unban request was last updated, in timestamp format.
  status: 0 | 1 | 2;                  // The status of the unban request: 0 = pending, 1 = accepted, 2 = rejected.

  user_invalid?: boolean;             // Optional: Indicates if the user image is invalid (e.g., avatar changed).
  staff_invalid?: boolean;            // Optional: Indicates if the staff image is invalid (e.g., avatar changed).
}

export interface BackupData {
  enabled?: boolean;                  // Indicates if the backup feature is enabled.
  backup_date: number | null;         // The date when the last backup was created, in timestamp format.
  channels: Channel[];                // An array of channels in the guild.
  roles: Role[];                      // An array of role IDs in the guild.
}

export interface SecurityFeature {
  guild_id?: string;                  // The ID of the guild for which the security features are configured.
  category: 0 | 1 | 2 | 3;            // raw api value of the category, used for the API.
  enabled: boolean;                   // Indicates if the feature is enabled (default: true).

  // Categories: 0 (Account Age), 1 (Fake Detection), 2 (Spam Account), 3 (Nuke protection)
}

export const initFeatures: SecurityFeature[] = [
  { category: 0, enabled: false },    // Account age verification
  { category: 1, enabled: false },    // Fake account detection
  { category: 2, enabled: false },    // Spam account detection
  { category: 3, enabled: false }     // Nuke protection
]

export interface SecurityModal {
  action: 0 | 1,
  element: HTMLButtonElement
}
