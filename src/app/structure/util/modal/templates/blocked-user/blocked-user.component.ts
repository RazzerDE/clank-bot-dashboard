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

  /**
   * Checks if the `newBlockedUser` object is valid.
   * A user is considered invalid if the `user_id` is missing or if a `reason` is provided.
   *
   * @returns `true` if the user is invalid, otherwise `false`.
   */
  protected isBlockedUserValid(): boolean {
    return (Boolean(this.newBlockedUser.user_id) && Boolean(this.newBlockedUser.reason) && /^\d+$/.test(this.newBlockedUser.user_id));
  }

  /**
   * Removes all non-digit characters from the `user_id` property of `newBlockedUser`.
   * This ensures that the `user_id` contains only numeric characters.
   *
   * Avoid typescripts "rounding" on big numbers.
   */
  protected removeCharsFromUserId(): void {
    this.newBlockedUser.user_id = this.newBlockedUser.user_id.replace(/\D/g, '');
  }
}
