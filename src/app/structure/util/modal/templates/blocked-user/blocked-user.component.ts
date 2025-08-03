import {Component, Input} from '@angular/core';
import {BlockedUser} from "../../../../../services/types/discord/User";
import {DatePipe, NgClass} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'template-blocked-user',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    TranslatePipe,
    FormsModule,
    NgClass
  ],
  templateUrl: './blocked-user.component.html',
  styleUrl: './blocked-user.component.scss'
})
export class BlockedUserComponent {
  @Input() type: 'BLOCKED_USER_ADD' | 'BLOCKED_USER_EDIT' = 'BLOCKED_USER_ADD'
  @Input() newBlockedUser: BlockedUser = {} as BlockedUser;
  @Input() block_action: (blockedUser: BlockedUser) => void = (): void => {};
  @Input() block_edit: (blockedUser: BlockedUser) => void = (): void => {};
  protected readonly today: Date = new Date();

  /**
   * Checks if the `newBlockedUser` object is valid.
   * A user is considered invalid if the `user_id` is missing or if a `reason` is provided.
   *
   * @returns `true` if the user is valid, otherwise `false`.
   */
  protected isBlockedUserValid(): boolean {
    const inputValid: boolean = (Boolean(this.newBlockedUser.user_id) && Boolean(this.newBlockedUser.reason) && /^\d+$/.test(this.newBlockedUser.user_id));

    // check if the end date is set and in the past
    if (this.newBlockedUser.end_date != null) {
      const endDate = new Date(this.newBlockedUser.end_date);
      if (endDate < new Date()) { return false; }
    }

    return inputValid;
  }

  /**
   * Removes all non-digit characters from the `user_id` property of `newBlockedUser`.
   * This ensures that the `user_id` contains only numeric characters.
   *
   * Avoid typescripts "rounding" on big numbers.
   */
  protected removeCharsFromUserId(): void {
    if (!this.newBlockedUser.user_id) { return; }
    this.newBlockedUser.user_id = this.newBlockedUser.user_id.replace(/\D/g, '');
  }
}
