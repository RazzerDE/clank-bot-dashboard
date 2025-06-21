import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {FormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {Channel, Role} from "../../../../../services/types/discord/Guilds";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {SelectItems} from "../../../../../services/types/Config";

@Component({
  selector: 'template-select',
    imports: [
        FaIconComponent,
        FormsModule,
        TranslatePipe
    ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent {
  @Input() id: string = 'rolepicker';
  @Input() type: string = '';
  @Input() options: Role[] | Channel[] | SelectItems[] = [];
  @Input() isDefaultMentioned: (role_id: string) => boolean = () => false;
  isRolePickerValid: boolean = false;
  @Output() selectionChange = new EventEmitter<string[] | string>();

  @ViewChild('rolePicker') rolePicker!: ElementRef<HTMLSelectElement>;
  protected readonly faChevronDown: IconDefinition = faChevronDown;

  constructor(private translate: TranslateService, protected dataService: DataHolderService) {}

  /**
   * Validates the role picker selection.
   *
   * This method checks the value of the role picker element and sets the `isRolePickerValid`
   * property to `true` if a valid role is selected, otherwise sets it to `false`.
   */
  changeSelectPicker(): void {
    if (this.options.length === 0) { return; }

    // channel or role type
    if (!this.isSelectItemsType(this.options[0])) {
      const selectedRole: string = this.rolePicker.nativeElement.value;
      this.isRolePickerValid = selectedRole !== '' && selectedRole !==
        (this.isRoleType(this.options[0]) ?
          this.translate.instant('PLACEHOLDER_ROLE_MODAL_DEFAULT') :
          this.translate.instant('PLACEHOLDER_CHANNEL_MODAL_DEFAULT'));

      const selectEl: HTMLSelectElement = this.rolePicker.nativeElement;
      const selectedRoles: string[] = Array.from(selectEl.selectedOptions).map(option => option.value);
      this.selectionChange.emit(selectedRoles);
      return;
    }

    // all other types of select items
    const selectEl: HTMLSelectElement = this.rolePicker.nativeElement;
    this.selectionChange.emit(selectEl.selectedOptions[0]?.value)
  }

  /**
   * Type guard to check if a value is of type `Role`.
   *
   * @param value - The value to check, which can be a SelectItems or a `Role` object.
   * @returns `true` if the value is a `Role` object, otherwise `false`.
   */
  protected isRoleType(value: SelectItems | Role | Channel): value is Role {
    return value !== null && 'id' in value && 'name' in value;
  }

  /**
   * Type guard to check if a value is of type `SelectItems`.
   *
   * @param value - The value to check, which can be a Role or a `SelectItems` object.
   * @returns `true` if the value is a `SelectItems` object, otherwise `false`.
   */
  protected isSelectItemsType(value: SelectItems | Role | Channel): value is SelectItems {
    return value !== null && 'label' in value && 'value' in value;
  }
}
