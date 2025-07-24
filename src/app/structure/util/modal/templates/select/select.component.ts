import {booleanAttribute, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {FormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {faHashtag, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {Channel, Role} from "../../../../../services/types/discord/Guilds";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {SelectItems} from "../../../../../services/types/Config";
import {NgClass} from "@angular/common";

@Component({
  selector: 'template-select',
  imports: [
    FaIconComponent,
    FormsModule,
    TranslatePipe,
    NgClass
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent {
  @Input() id: string = 'rolepicker';
  @Input() type: string = '';
  @Input({transform: booleanAttribute}) disabled: boolean = false;
  @Input() options: Role[] | Channel[] | SelectItems[] = [];
  @Input() activeOption: string | null = null;
  @Input() isDefaultMentioned: (role_id: string) => boolean = () => false;
  isRolePickerValid: boolean = false;
  @Output() selectionChange = new EventEmitter<string[] | string>();

  @ViewChild('rolePicker') rolePicker!: ElementRef<HTMLSelectElement>;
  protected readonly faChevronDown: IconDefinition = faChevronDown;
  protected readonly faHashtag: IconDefinition = faHashtag;

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

      if (this.type.startsWith('EVENTS_EFFECTS')) { selectEl.selectedIndex = 0; }
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

  /**
   * Type guard to check if a value is of type `Channel`.
   *
   * @param value - The value to check, which can be a SelectItems, Role, or `Channel` object.
   * @return `true` if the value is a `Channel` object, otherwise `false`.
   */
  protected isChannelType(value: SelectItems | Role | Channel): value is Channel {
    return value !== null && 'parent_id' in value && 'permission_overwrites' in value && 'nsfw' in value;
  }

  /**
   * Checks if the current options list represents a list of channels for event types.
   *
   * @returns `true` if the options array contains at least one element, the first element is a `Channel`,
   *          and the `type` string starts with `EVENTS_`; otherwise, `false`.
   */
  isChannelList(): boolean {
    return this.options.length > 0 && this.isChannelType(this.options[0]);
  }

  /**
   * Determines whether a select option should be disabled.
   *
   * @param optionValue - The value of the option to check.
   * @returns `true` if the option is currently selected and the type is 'SECURITY_UNBAN', otherwise `false`.
   */
  public isSelectDisabled(optionValue: string): boolean {
    const isCurrentlySelected: boolean = Boolean(
      (this.type?.startsWith('EVENTS_') || this.type === 'SECURITY_UNBAN') && this.activeOption?.startsWith(optionValue));

    return isCurrentlySelected && this.type === 'SECURITY_UNBAN';
  }
}
