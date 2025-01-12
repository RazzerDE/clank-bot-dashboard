import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactComponent } from './contact.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {WizardStep} from "../../../services/types/Forms";
import {HttpErrorResponse} from "@angular/common/http";
import {of, throwError} from "rxjs";
import {ElementRef} from "@angular/core";

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent, TranslateModule.forRoot(), HttpClientTestingModule, BrowserAnimationsModule],
      providers: [ { provide: ActivatedRoute, useValue: { } } ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true if any required field is empty in the wizard steps', () => {
    component['formGroupBug'].setValue({ bugName: '', bugSteps: 'Steps', bugExpected: 'Expected', bugActual: 'Actual' });
    expect(component['wizard_bug_steps'][0].isEmpty()).toBe(true);

    component['formGroupBug'].setValue({ bugName: 'Test Bug', bugSteps: 'Steps', bugExpected: '', bugActual: 'Actual' });
    expect(component['wizard_bug_steps'][1].isEmpty()).toBe(true);

    component['formGroupBug'].setValue({ bugName: 'Test Bug', bugSteps: '', bugExpected: 'Expected', bugActual: 'Actual' });
    expect(component['wizard_bug_steps'][2].isEmpty()).toBe(true);

    component['formGroupIdea'].setValue({ ideaTitle: '', ideaDescription: 'Description', ideaCategory: 'Category' });
    expect(component['wizard_idea_suggestion'][0].isEmpty()).toBe(true);

    component['formGroupIdea'].setValue({ ideaTitle: 'Title', ideaDescription: '', ideaCategory: 'Category' });
    expect(component['wizard_idea_suggestion'][1].isEmpty()).toBe(true);

    component['formGroupIdea'].setValue({ ideaTitle: 'Title', ideaDescription: 'Description', ideaCategory: '' });
    expect(component['wizard_idea_suggestion'][2].isEmpty()).toBe(true);
  });

  it('should return false if all required fields are filled in the wizard steps', () => {
    component['formGroupBug'].setValue({ bugName: 'Test Bug', bugSteps: 'Steps', bugExpected: 'Expected', bugActual: 'Actual' });
    expect(component['wizard_bug_steps'][0].isEmpty()).toBe(false);
    expect(component['wizard_bug_steps'][1].isEmpty()).toBe(false);
    expect(component['wizard_bug_steps'][2].isEmpty()).toBe(false);

    component['formGroupIdea'].setValue({ ideaTitle: 'Title', ideaDescription: 'Description', ideaCategory: 'Category' });
    expect(component['wizard_idea_suggestion'][0].isEmpty()).toBe(false);
    expect(component['wizard_idea_suggestion'][1].isEmpty()).toBe(false);
    expect(component['wizard_idea_suggestion'][2].isEmpty()).toBe(false);
  });

  it('should set document title and update form container height and isLoading flag', () => {
    document.body.innerHTML = "<div id='formBugReport' #formBugReport></div>";
    // Mock the formBugReport native element
    component['formBugReport'] = new ElementRef(document.getElementById('formBugReport') as HTMLDivElement);
    component['formBugReport'].nativeElement.style.height = '500px';

    // Spy on setTimeout to control its execution
    jest.spyOn(window, 'setTimeout');

    // Call ngAfterViewInit
    component.ngAfterViewInit();

    // Check if document title is set correctly
    expect(document.title).toBe("Contact Us ~ Clank Discord-Bot");

    // Execute the first setTimeout callback
    (setTimeout as any).mock.calls[0][0]();

    // Check if formContainerHeight is set correctly
    // expect(component['formContainerHeight']).toBe('500px');
    expect(component['current_steps'].bug_report).toBe(1);

    // Execute the second setTimeout callback
    (setTimeout as any).mock.calls[1][0]();

    // Check if isLoading flag is set to false
    expect(component['dataService'].isLoading).toBe(false);
  });

  it('should switch to the next step in bug report form if current step is less than wizard steps length', () => {
    component['current_steps'].bug_report = 1;
    component['wizard_bug_steps'] = [{}, {}, {}] as WizardStep[];
    component['bugReportSent'] = false;

    component.sendForm('BUG');
    expect(component['current_steps'].bug_report).toBe(2);
  });

  it('should send bug report if current step is equal to wizard steps length', () => {
    component['current_steps'].bug_report = 3;
    component['wizard_bug_steps'] = [{}, {}, {}] as WizardStep[];
    component['bugReportSent'] = false;

    const spy = jest.spyOn(component['apiService'], 'sendBugReport').mockReturnValue(of({}));

    component.sendForm('BUG');
    expect(component['bugReportSent']).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should switch to the next step in idea suggestion form if current step is less than wizard steps length', () => {
    component['current_steps'].idea_suggestion = 1;
    component['wizard_idea_suggestion'] = [{}, {}, {}] as WizardStep[];
    component['ideaSuggestionSent'] = false;

    component.sendForm('IDEA');
    expect(component['current_steps'].idea_suggestion).toBe(2);
  });

  it('should send idea suggestion if current step is equal to wizard steps length', () => {
    component['current_steps'].idea_suggestion = 3;
    component['wizard_idea_suggestion'] = [{}, {}, {}] as WizardStep[];
    component['ideaSuggestionSent'] = false;

    const spy = jest.spyOn(component['apiService'], 'sendIdeaSuggestion').mockReturnValue(of({}));

    component.sendForm('IDEA');
    expect(component['ideaSuggestionSent']).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should handle error when sending bug report', () => {
    document.body.innerHTML = "<p id='bugReportInfo' #bugReportInfo></p>";
    component['current_steps'].bug_report = 3;
    component['wizard_bug_steps'] = [{}, {}, {}] as WizardStep[];
    component['bugReportSent'] = false;

    const spy = jest.spyOn(component['apiService'], 'sendBugReport').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    component['bugReportInfo'] = new ElementRef(document.getElementById('bugReportInfo') as HTMLParagraphElement);

    component.sendForm('BUG');
    expect(component['bugReportSent']).toBe(true);
    expect(spy).toHaveBeenCalled();
    expect(component['bugReportInfo'].nativeElement.innerText).not.toEqual('');
  });

  it('should handle error when sending idea suggestion', () => {
    document.body.innerHTML = "<p id='ideaSuggestionInfo' #ideaSuggestionInfo></p>";
    component['current_steps'].idea_suggestion = 3;
    component['wizard_idea_suggestion'] = [{}, {}, {}] as WizardStep[];
    component['ideaSuggestionSent'] = false;

    const spy = jest.spyOn(component['apiService'], 'sendIdeaSuggestion').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    component['ideaSuggestionInfo'] = new ElementRef(document.getElementById('ideaSuggestionInfo') as HTMLParagraphElement);

    component.sendForm('IDEA');
    expect(spy).toHaveBeenCalled();
    expect(component['ideaSuggestionSent']).toBe(true);
    expect(component['ideaSuggestionInfo'].nativeElement.innerText).not.toEqual('');
    expect(component['ideaSuggestionInfo'].nativeElement.classList).toContain('!text-red-600');
  });

  it('should toggle to the next step if the step is not empty and report is not sent', () => {
    component['current_steps'].bug_report = 1;
    component['bugReportSent'] = false;
    component['formGroupBug'].setValue({ bugName: 'Test Bug', bugSteps: 'Steps', bugExpected: 'Expected', bugActual: 'Actual' });

    component.toggleStep(2, 'BUG');
    expect(component['current_steps'].bug_report).toBe(3);
  });

  it("should jump to the next step for type 'IDEA' & because of step is biggre than current step", () => {
    component['wizard_idea_suggestion'] = [{ title: 'string', isEmpty: () => true }];
    component['current_steps'].idea_suggestion = 1;

    component.toggleStep(3, 'IDEA');
    expect(component['current_steps'].idea_suggestion).toBe(4);

    // test if the step is bigger than the current step
    component['current_steps'].idea_suggestion = 1;

    component.toggleStep(1, 'IDEA');
    expect(component['current_steps'].idea_suggestion).toBe(1);
  });

  it('should not toggle to the next step if the report is sent', () => {
    component['current_steps'].bug_report = 1;
    component['bugReportSent'] = true;
    component['formGroupBug'].setValue({ bugName: 'Test Bug', bugSteps: 'Steps', bugExpected: 'Expected', bugActual: 'Actual' });

    component.toggleStep(2, 'BUG');
    expect(component['current_steps'].bug_report).toBe(1);
  });
});
