import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslateModule, TranslatePipe} from "@ngx-translate/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {DataHolderService} from "../../../../../../services/data/data-holder.service";

@Component({
  selector: 'req-field',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, TranslatePipe],
  templateUrl: './req-field.component.html'
})
export class RequirementFieldComponent {
  @Input() id!: string;
  @Input() value!: string;
  @Input() labelText!: string;
  @Input() placeholderKey!: string;
  @Input() required: boolean = false;
  @Output() inputChange: EventEmitter<Event> = new EventEmitter<Event>();

  constructor(protected dataService: DataHolderService) {}

  /**
   * Emits the input event when the user types in the field.
   * @param event The input event from the text field.
   */
  onInput(event: Event): void {
    this.inputChange.emit(event);
  }
}
