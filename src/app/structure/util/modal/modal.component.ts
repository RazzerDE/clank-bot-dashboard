import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TranslatePipe} from "@ngx-translate/core";
import {faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {Role} from "../../../services/types/discord/Guilds";
import {NgClass} from "@angular/common";
import {DataHolderService} from "../../../services/data/data-holder.service";
import {ComService} from "../../../services/discord-com/com.service";

@Component({
  selector: 'app-modal',
  imports: [
    FaIconComponent,
    TranslatePipe,
    NgClass
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @Input() discordRoles: Role[] = [];
  @Input() type: string = '';
  @Input() action: (selectedRole: HTMLOptionElement) => void = (): void => {};

  protected activeTab: number = 0;
  protected isRolePickerValid: boolean = false;
  protected readonly faXmark: IconDefinition = faXmark;
  protected readonly faChevronDown: IconDefinition = faChevronDown;

  @ViewChild('rolePicker') rolePicker!: ElementRef<HTMLSelectElement>;
  @ViewChild('roleModal') roleModal!: ElementRef<HTMLDivElement>;
  @ViewChild('roleModalContent') modalContent!: ElementRef<HTMLDivElement>;
  @ViewChild('roleBackdrop') roleBackdrop!: ElementRef<HTMLDivElement>;

  constructor(protected dataService: DataHolderService, protected discordService: ComService ) {
  }

  /**
   * Validates the role picker selection.
   *
   * This method checks the value of the role picker element and sets the `isRolePickerValid`
   * property to `true` if a valid role is selected, otherwise sets it to `false`.
   */
  validateRolePicker(): void {
    const selectedRole: string = this.rolePicker.nativeElement.value;
    this.isRolePickerValid = selectedRole !== '' && selectedRole !== '👥 - Wähle eine Discord-Rolle aus..';
  }

  showModal(): void {
    this.roleModal.nativeElement.classList.remove('hidden');
    this.roleBackdrop.nativeElement.classList.remove('hidden');
  }

  hideModal(): void {
    this.roleModal.nativeElement.classList.add('hidden');
    this.roleBackdrop.nativeElement.classList.add('hidden');
  }
}
