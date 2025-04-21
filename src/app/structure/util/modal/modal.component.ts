import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {Role} from "../../../services/types/discord/Guilds";
import {NgClass} from "@angular/common";
import {DataHolderService} from "../../../services/data/data-holder.service";
import {MarkdownPipe} from "../../../pipes/markdown/markdown.pipe";
import {faTrashCan} from "@fortawesome/free-solid-svg-icons/faTrashCan";

@Component({
  selector: 'app-modal',
  imports: [
    FaIconComponent,
    TranslatePipe,
    NgClass,
    MarkdownPipe,
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @Input() discordRoles: Role[] = [];
  @Input() type: string = '';
  @Input() content: string = '';
  @Input() extra: Role[] = [];

  @Input() action: (selectedRole: HTMLCollectionOf<HTMLOptionElement>, useDelete?: boolean) => void = (): void => {};

  public activeTab: number = 0;
  protected isRolePickerValid: boolean = false;
  protected readonly faXmark: IconDefinition = faXmark;
  protected readonly faChevronDown: IconDefinition = faChevronDown;
  protected readonly faTrashCan: IconDefinition = faTrashCan;

  @ViewChild('rolePicker') rolePicker!: ElementRef<HTMLSelectElement>;
  @ViewChild('roleModal') roleModal!: ElementRef<HTMLDivElement>;
  @ViewChild('roleModalContent') modalContent!: ElementRef<HTMLDivElement>;
  @ViewChild('roleBackdrop') roleBackdrop!: ElementRef<HTMLDivElement>;

  constructor(protected dataService: DataHolderService, private translate: TranslateService) {}

  /**
   * Validates the role picker selection.
   *
   * This method checks the value of the role picker element and sets the `isRolePickerValid`
   * property to `true` if a valid role is selected, otherwise sets it to `false`.
   */
  validateRolePicker(): void {
    const selectedRole: string = this.rolePicker.nativeElement.value;
    this.isRolePickerValid = selectedRole !== '' && selectedRole !== this.translate.instant('PLACEHOLDER_ROLE_MODAL_DEFAULT');
  }

  /**
   * Displays the modal by removing the `hidden` class from the modal and backdrop elements.
   */
  showModal(): void {
    this.roleModal.nativeElement.classList.remove('hidden');
    this.roleBackdrop.nativeElement.classList.remove('hidden');
  }

  /**
   * Hides the modal by adding the `hidden` class to the modal and backdrop elements.
   */
  hideModal(): void {
    this.roleModal.nativeElement.classList.add('hidden');
    this.roleBackdrop.nativeElement.classList.add('hidden');
  }

  /**
   * Checks if a given role ID is mentioned in the `extra` roles.
   *
   * This method verifies whether the provided `role_id` exists in the `extra` array.
   *
   * @param role_id - The ID of the role to check.
   * @returns `true` if the role ID is found in the `extra` array, otherwise `false`.
   */
  isDefaultMentioned(role_id: string): boolean {
    return (this.extra && this.extra.some(extraRole => extraRole.id === role_id))
  }
}
