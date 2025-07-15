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

  user_invalid?: boolean;            // Optional: Indicates if the user image is invalid (e.g., avatar changed).
  staff_invalid?: boolean;           // Optional: Indicates if the staff image is invalid (e.g., avatar changed).
}
