import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnippetAddComponent } from './snippet-add.component';
import {TranslateModule} from "@ngx-translate/core";

describe('SnippetAddComponent', () => {
  let component: SnippetAddComponent;
  let fixture: ComponentFixture<SnippetAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnippetAddComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnippetAddComponent);
    component = fixture.componentInstance;
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

  it('should update the snippet preview with placeholder text when input is empty', () => {
    const mockEvent = {target: {value: ''}} as unknown as KeyboardEvent;
    const ticketPreviewMock = { nativeElement: { innerHTML: '' } };
    component.discordMarkdown = { ticketPreview: ticketPreviewMock } as any;
    const translateSpy = jest.spyOn(component['translate'], 'instant').mockReturnValue('PLACEHOLDER_SNIPPET_PREVIEW_DESC');

    component['updateSnippetPreview'](mockEvent);

    expect(translateSpy).toHaveBeenCalledWith('PLACEHOLDER_SNIPPET_PREVIEW_DESC');
    expect(ticketPreviewMock.nativeElement.innerHTML).toBe('PLACEHOLDER_SNIPPET_PREVIEW_DESC');
  });

  it('should update the snippet preview with transformed markdown when input is not empty', () => {
    const mockEvent = {target: {value: 'Test Markdown'}} as unknown as KeyboardEvent;
    const ticketPreviewMock = { nativeElement: { innerHTML: '' } };
    component.discordMarkdown = { ticketPreview: ticketPreviewMock } as any;
    const markdownTransformSpy = jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('<p>Transformed Markdown</p>');

    component['updateSnippetPreview'](mockEvent);

    expect(markdownTransformSpy).toHaveBeenCalledWith('Test Markdown');
    expect(ticketPreviewMock.nativeElement.innerHTML).toBe('<p>Transformed Markdown</p>');
  });

  it('should use externalMarkdown if discordMarkdown is undefined', () => {
    const mockEvent = {target: {value: 'External Markdown'}} as unknown as KeyboardEvent;
    const ticketPreviewMock = { nativeElement: { innerHTML: '' } };
    component.discordMarkdown = undefined as any;
    component.externalMarkdown = { ticketPreview: ticketPreviewMock } as any;
    const markdownTransformSpy = jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('<p>External Transformed Markdown</p>');

    component['updateSnippetPreview'](mockEvent);

    expect(markdownTransformSpy).toHaveBeenCalledWith('External Markdown');
    expect(ticketPreviewMock.nativeElement.innerHTML).toBe('<p>External Transformed Markdown</p>');
  });

  it('should return true if the snippet name or description is empty', () => {
    component.newSnippet = { name: '', desc: 'Valid description' } as any;
    expect(component['isSnippetInvalid']()).toBe(true);

    component.newSnippet = { name: 'Valid name', desc: '' } as any;
    expect(component['isSnippetInvalid']()).toBe(true);
  });
});
