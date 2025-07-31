import {Component, Input, ViewChild} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TranslatePipe} from "@ngx-translate/core";
import {SelectComponent} from "../select/select.component";
import {NgClass} from "@angular/common";
import {faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {Role} from "../../../../../services/types/discord/Guilds";
import {DataHolderService} from "../../../../../services/data/data-holder.service";

@Component({
  selector: 'template-role-picker',
  imports: [
    FaIconComponent,
    TranslatePipe,
    SelectComponent,
    NgClass
  ],
  templateUrl: './role-picker.component.html',
  styleUrl: './role-picker.component.scss'
})
export class RolePickerComponent {
  @Input() type: string = '';
  @Input() discordRoles: Role[] = [];
  @Input() isDefaultMentioned: (role_id: string) => boolean = () => false;
  @Input() action: (selectedRole: HTMLCollectionOf<HTMLOptionElement>, useDelete?: boolean) => void = (): void => {};

  public activeTab: number = 0;
  protected readonly faTrashCan: IconDefinition = faTrashCan;
  @ViewChild(SelectComponent, { static: true }) selectComponent!: SelectComponent;

  constructor(protected dataService: DataHolderService) {}
}
