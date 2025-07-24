import {Component, Input} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {SecurityModal} from "../../../../../services/types/Security";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'template-confirm-dialog',
  imports: [
    NgOptimizedImage,
    TranslatePipe
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  @Input() type: string = '';
  @Input() obj: SecurityModal = {} as SecurityModal;
  @Input() shield_action: (action: 0 | 1 | 2, element: HTMLButtonElement) => void = (): void => {};

}
