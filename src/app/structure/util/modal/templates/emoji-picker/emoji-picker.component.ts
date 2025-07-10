import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {Emoji} from "../../../../../services/types/discord/Guilds";
import {DataHolderService} from "../../../../../services/data/data-holder.service";

@Component({
  selector: 'template-emoji-picker',
  imports: [
    NgOptimizedImage,
    NgClass
  ],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss'
})
export class EmojiPickerComponent {
  @Input() type: string = 'SUPPORT_THEMES';
  @Output() selected_emoji: EventEmitter<Emoji | string> = new EventEmitter<Emoji | string>();

  constructor(protected dataService: DataHolderService) {}

  /**
   * Type guard to determine if an object is of type Emoji rather than string.
   *
   * This function checks if the provided object has an 'id' property defined,
   * which indicates it's an Emoji object rather than a plain string.
   *
   * @param {Emoji | string} obj - The object to check, which could be either an Emoji or a string
   * @returns {boolean} True if the object is an Emoji, false if it's a string
   */
  isEmojiType(obj: Emoji | string): obj is Emoji {
    return (obj as Emoji).id !== undefined;
  }

  /**
   * Handles the selection of an emoji or emoji string.
   *
   * If the selected emoji is of type `Emoji`, it retrieves the full emoji object using the data service.
   * Otherwise, it ensures the value is a string. After processing, the emoji picker is closed and
   * the selected emoji is emitted to the parent component.
   *
   * @param {Emoji | string} emoji - The selected emoji, either as an `Emoji` object or a string.
   */
  onEmojiSelect(emoji: Emoji | string): void {
    if (!this.isEmojiType(emoji)) {
      emoji = emoji.toString();
    }

    this.dataService.showEmojiPicker = false;
    this.selected_emoji.emit(emoji);
  }

  /**
   * Listens for any click event on the document.
   *
   * This method is used to hide the emoji picker when:
   * - An emoji is selected (the picker is open and a click occurs)
   * - The user clicks outside the emoji picker
   */
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.dataService.showEmojiPicker) {
      this.dataService.showEmojiPicker = false;
    }
  }

}
