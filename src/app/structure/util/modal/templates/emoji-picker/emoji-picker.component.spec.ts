import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiPickerComponent } from './emoji-picker.component';
import {Emoji} from "../../../../../services/types/discord/Guilds";
import {TranslateModule} from "@ngx-translate/core";

describe('EmojiPickerComponent', () => {
  let component: EmojiPickerComponent;
  let fixture: ComponentFixture<EmojiPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmojiPickerComponent, TranslateModule.forRoot()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmojiPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true if object is of type Emoji', () => {
    const emoji = {id: '123', name: 'smile'} as unknown as Emoji;
    expect(component.isEmojiType(emoji)).toBe(true);
  });

  it('should return false if object is a string', () => {
    const emojiString = 'smile';
    expect(component.isEmojiType(emojiString)).toBe(false);
  });

  it('should handle emoji string selection correctly', () => {
    const emojiString = '😊';
    jest.spyOn(component, 'isEmojiType').mockReturnValue(false);
    jest.spyOn(component.selected_emoji, 'emit');

    component.onEmojiSelect(emojiString);

    expect(component['dataService'].showEmojiPicker).toBeFalsy();
    expect(component.selected_emoji.emit).toHaveBeenCalledWith(emojiString);
  });

  it('should handle Emoji object selection correctly', () => {
    const emojiObject = { id: '123', name: 'smiley' } as Emoji;
    jest.spyOn(component, 'isEmojiType').mockReturnValue(true);
    jest.spyOn(component.selected_emoji, 'emit');

    component.onEmojiSelect(emojiObject);

    expect(component['dataService'].showEmojiPicker).toBeFalsy();
    expect(component.selected_emoji.emit).toHaveBeenCalledWith(emojiObject);
  });

  it('should close emoji picker when selecting any emoji', () => {
    const emoji = '👍';
    component['dataService'].showEmojiPicker = true;

    component.onEmojiSelect(emoji);

    expect(component['dataService'].showEmojiPicker).toBeFalsy();
  });

  it('should hide the emoji picker when a document click occurs and showEmojiPicker is true', () => {
    component['dataService'].showEmojiPicker = true;
    component.onDocumentClick();
    expect(component['dataService'].showEmojiPicker).toBe(false);
  });

  it('should not change showEmojiPicker when a document click occurs and showEmojiPicker is false', () => {
    component['dataService'].showEmojiPicker = false;
    component.onDocumentClick();
    expect(component['dataService'].showEmojiPicker).toBe(false);
  });
});
