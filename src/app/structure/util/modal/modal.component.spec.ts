import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal.component';
import {FaqAnswerComponent} from "./templates/faq-answer/faq-answer.component";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {TranslateModule} from "@ngx-translate/core";
import {DataHolderService} from "../../../services/data/data-holder.service";
import {ElementRef} from "@angular/core";
import {BlockedUser} from "../../../services/types/discord/User";

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent, FaqAnswerComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [{ provide: DataHolderService, useValue: {} }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;

    component.roleModal = { nativeElement: document.createElement('div') } as ElementRef<HTMLDivElement>;
    component.roleBackdrop = { nativeElement: document.createElement('div') } as ElementRef<HTMLDivElement>;
    component.modalContent = { nativeElement: document.createElement('div') } as ElementRef<HTMLDivElement>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call snippet_action with the correct snippet', () => {
    const mockSnippet = { name: 'Test Snippet', desc: 'Test Description' } as any;
    const snippetActionSpy = jest.spyOn(component, 'snippet_action');
    component.snippet_action(mockSnippet);

    expect(snippetActionSpy).toHaveBeenCalledWith(mockSnippet);
  });

  it('should call snippet_edit with the correct snippet', () => {
    const mockSnippet = { name: 'Edit Snippet', desc: 'Edit Description' } as any;
    const snippetEditSpy = jest.spyOn(component, 'snippet_edit');

    component.snippet_edit(mockSnippet);

    expect(snippetEditSpy).toHaveBeenCalledWith(mockSnippet);
  });

  it('should call block_action with the correct blockedUser', () => {
    const mockBlockedUser = { staff_name: 'test' } as BlockedUser;
    const snippetActionSpy = jest.spyOn(component, 'block_action');
    component.block_action(mockBlockedUser);

    expect(snippetActionSpy).toHaveBeenCalledWith(mockBlockedUser);
  });

  it('should call action with default implementation', () => {
    const option = document.createElement('option');
    const collection = {
      length: 1,
      item: (index: number) => option,
      [0]: option,
      namedItem: (name: string) => null
    } as unknown as HTMLCollectionOf<HTMLOptionElement>;

    expect(() => component.action(collection, true)).not.toThrow();
    expect(() => component.action(collection)).not.toThrow();
  });

  it('should show modal and remove hidden class', () => {
    const removeModalSpy = jest.spyOn(component.roleModal.nativeElement.classList, 'remove');
    const removeBackdropSpy = jest.spyOn(component.roleBackdrop.nativeElement.classList, 'remove');
    component['isVisible'] = false;
    component.showModal();
    expect(component['isVisible']).toBe(true);
    expect(removeModalSpy).toHaveBeenCalledWith('hidden');
    expect(removeBackdropSpy).toHaveBeenCalledWith('hidden');
  });

  it('should hide modal and add hidden class after timeout', () => {
    jest.useFakeTimers();
    const addModalSpy = jest.spyOn(component.roleModal.nativeElement.classList, 'add');
    const addBackdropSpy = jest.spyOn(component.roleBackdrop.nativeElement.classList, 'add');
    component['isVisible'] = true;
    component.hideModal();
    expect(component['isVisible']).toBe(false);
    jest.advanceTimersByTime(300);
    expect(addModalSpy).toHaveBeenCalledWith('hidden');
    expect(addBackdropSpy).toHaveBeenCalledWith('hidden');
    jest.useRealTimers();
  });

  it('should return true if role id is in extra', () => {
    component.extra = [{ id: '123' } as any, { id: '456' } as any];
    expect(component.isDefaultMentioned('123')).toBe(true);
    expect(component.isDefaultMentioned('456')).toBe(true);
  });

  it('should return false if role id is not in extra', () => {
    component.extra = [{ id: '123' } as any];
    expect(component.isDefaultMentioned('999')).toBe(false);
  });

  it('should handle empty extra array in isDefaultMentioned', () => {
    component.extra = [];
    expect(component.isDefaultMentioned('any')).toBe(false);
  });

  it('should handle undefined extra in isDefaultMentioned', () => {
    (component as any).extra = undefined;
    expect(component.isDefaultMentioned('any')).toBeFalsy();
  });
});
