import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {FormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {Role} from "../../../../../services/types/discord/Guilds";
import {DataHolderService} from "../../../../../services/data/data-holder.service";

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
  @Input() type: string = '';
  @Input() discordRoles: Role[] = [];
  @Input() isDefaultMentioned: (role_id: string) => boolean = () => false;
  isRolePickerValid: boolean = false;
  @Output() selectionChange = new EventEmitter<any[]>();

  @ViewChild('rolePicker') rolePicker!: ElementRef<HTMLSelectElement>;
  protected readonly faChevronDown: IconDefinition = faChevronDown;

  constructor(private translate: TranslateService, protected dataService: DataHolderService) {}
  /**
   * Validates the role picker selection.
   *
   * This method checks the value of the role picker element and sets the `isRolePickerValid`
   * property to `true` if a valid role is selected, otherwise sets it to `false`.
   */
  validateRolePicker(): void {
    const selectedRole: string = this.rolePicker.nativeElement.value;
    this.isRolePickerValid = selectedRole !== '' && selectedRole !== this.translate.instant('PLACEHOLDER_ROLE_MODAL_DEFAULT');

    const selectEl: HTMLSelectElement = this.rolePicker.nativeElement;
    const selectedRoles: string[] = Array.from(selectEl.selectedOptions).map(option => option.value);
    this.selectionChange.emit(selectedRoles);
  }
}
