import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {DataHolderService} from "../../../services/data/data-holder.service";
import {HeaderComponent} from "../../../structure/header/header.component";
import {NgClass} from "@angular/common";
import {SidebarComponent} from "../../../structure/sidebar/sidebar.component";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons/faChevronRight";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {RouterLink} from "@angular/router";
import {faDiscord} from "@fortawesome/free-brands-svg-icons";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {animate, group, query, state, style, transition, trigger} from "@angular/animations";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {WizardStep, FormStep, bug_steps, CurrentStep, idea_steps} from "../../../services/types/Forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {ApiService} from "../../../services/api/api.service";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    NgClass,
    FaIconComponent,
    RouterLink,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  animations: [
    trigger('stepContent', [
      transition(':enter', [
        style({
          position: 'absolute',
          top: 0,
          left: '100%',
          width: '100%',
          opacity: 0,
        }),
        group([
          animate('300ms ease-out', style({
            left: '0',
            opacity: 1
          })),
          query(':self', [
            style({ height: '0' }),
            animate('300ms ease-out', style({ height: '*' }))
          ])
        ])
      ]),
      transition(':leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        }),
        group([
          animate('300ms ease-out', style({
            left: '-100%',
            opacity: 0
          })),
          query(':self', [
            style({ height: '*' }),
            animate('300ms ease-out', style({ height: '0' }))
          ])
        ])
      ])
    ]),
    trigger('slideAnimation', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('*', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('void => *', [
        animate('300ms ease-out')
      ])
    ])
  ]
})
export class ContactComponent implements AfterViewInit {
  protected current_steps: CurrentStep = { bug_report: 2, idea_suggestion: 1 };
  protected bugReportSent: boolean = false;
  protected ideaSuggestionSent: boolean = false;

  protected wizard_bug_steps: WizardStep[] = [
    { title: 'WIZARD_STEP_FIRST', isEmpty: () => this.formGroupBug.get('bugName')?.value === '' },
    { title: 'WIZARD_STEP_SECOND', isEmpty: () => this.formGroupBug.get('bugExpected')!.value === '' ||
                                                           this.formGroupBug.get('bugActual')!.value === '' },
    { title: 'WIZARD_STEP_THIRD', isEmpty: () => this.formGroupBug.get('bugSteps')?.value === '' },
  ];
  protected wizard_idea_suggestion: WizardStep[] = [
    { title: 'WIZARD_STEP_FIRST_IDEA', isEmpty: () => this.formGroupIdea.get('ideaTitle')?.value === '' },
    { title: 'WIZARD_STEP_SECOND_IDEA', isEmpty: () => this.formGroupIdea.get('ideaDescription')?.value === '' },
    { title: 'WIZARD_STEP_THIRD_IDEA', isEmpty: () => this.formGroupIdea.get('ideaCategory')?.value === '' },
  ];

  protected form_bug_steps = bug_steps;
  protected form_idea_steps = idea_steps;
  protected formGroupBug: FormGroup = new FormGroup({ bugName: new FormControl('', [Validators.required]),
    bugSteps: new FormControl('', [Validators.required]), bugExpected: new FormControl('', [Validators.required]),
    bugActual: new FormControl('', [Validators.required])
  });
  protected formGroupIdea: FormGroup = new FormGroup({ ideaTitle: new FormControl('', [Validators.required]),
    ideaDescription: new FormControl('', [Validators.required]), ideaCategory: new FormControl('', [Validators.required]),
  });

  @ViewChild('formBugReport') private formBugReport!: ElementRef<HTMLDivElement>;
  @ViewChild('bugReportInfo') protected bugReportInfo!: ElementRef<HTMLParagraphElement>;
  @ViewChild('ideaSuggestionInfo') protected ideaSuggestionInfo!: ElementRef<HTMLParagraphElement>;
  protected formContainerHeight: string = 'auto';

  protected readonly faChevronRight: IconDefinition = faChevronRight;
  protected readonly faDiscord: IconDefinition = faDiscord;

  constructor(protected dataService: DataHolderService, protected translate: TranslateService,
              private apiService: ApiService) {
    this.dataService.hideGuildSidebar = true;
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * Subscribes to language change events and updates the document title accordingly.
   * Also sets the `isLoading` flag in the `DataHolderService` to `false` after the language change event.
   */
  ngAfterViewInit(): void {
    document.title = "Contact Us ~ Clank Discord-Bot";

    setTimeout((): void => {  // set fixed height for form container, based on the biggest step
      this.formContainerHeight = `${this.formBugReport.nativeElement.scrollHeight}px`;
      this.current_steps.bug_report = 1;
    }, 0);

    // avoid flicker of bug report form
    setTimeout((): void => { this.dataService.isLoading = false }, 400);
  }

  /**
   * Sends the form data to the server.
   * @param type - The type of form to send.
   */
  sendForm(type: 'IDEA' | 'BUG'): void {
    if (type === 'BUG') {
      // switch to next step in bug report form
      if (this.current_steps.bug_report < this.wizard_bug_steps.length) {
        this.current_steps.bug_report++;
      } else {
        // send bug report
        this.bugReportSent = true;

        this.apiService.sendBugReport(this.formGroupBug.value).subscribe({
          error: (_error: HttpErrorResponse): void => {
            this.bugReportInfo.nativeElement.innerText = this.translate.instant('PLACEHOLDER_CONTACT_ERROR');
            this.bugReportInfo.nativeElement.classList.add('!text-red-600');
          }
        });
      }
    } else if (type === 'IDEA') {
      // switch to next step in idea suggestion form
      if (this.current_steps.idea_suggestion < this.wizard_idea_suggestion.length) {
        this.current_steps.idea_suggestion++;
      } else {
        // send idea suggestion
        this.ideaSuggestionSent = true;

        const form_data = { ...this.formGroupIdea.value, profile: this.dataService.profile };
        this.apiService.sendIdeaSuggestion(form_data).subscribe({
          error: (_error: HttpErrorResponse): void => {
            this.ideaSuggestionInfo.nativeElement.innerText = this.translate.instant('PLACEHOLDER_CONTACT_ERROR');
            this.ideaSuggestionInfo.nativeElement.classList.add('!text-red-600');
          }
        });
      }
    }
  }

  /**
   * Toggles the form to the specified step if the step is not empty.
   * @param step - The step to switch to.
   * @param type - The type of form to switch to.
   */
  toggleStep(step: number, type: 'IDEA' | 'BUG'): void {
    const steps: WizardStep[] = type === 'BUG' ? this.wizard_bug_steps : this.wizard_idea_suggestion;
    const currentStep: number = type === 'BUG' ? this.current_steps.bug_report : this.current_steps.idea_suggestion;
    const reportSent: boolean = type === 'BUG' ? this.bugReportSent : this.ideaSuggestionSent;

    // don't go if step is empty using formGroup
    if ((steps[step - 1] && steps[step - 1].isEmpty() && step >= currentStep) || reportSent) {
      return;
    }

    if (type === 'BUG') {
      this.current_steps.bug_report = step + 1;
    } else {
      this.current_steps.idea_suggestion = step + 1;
    }
  }

  /**
   * Checks if the current step in the form is valid.
   * @param type - The type of form to check.
   *
   * @returns True if the current step is empty, otherwise false.
   */
  isFormValid(type: 'IDEA' | 'BUG'): boolean {
    if (type === 'IDEA') {
      return this.wizard_idea_suggestion[this.current_steps.idea_suggestion - 1].isEmpty();
    } else {
      return this.wizard_bug_steps[this.current_steps.bug_report - 1].isEmpty();
    }
  }

  /**
   * Retrieves the form step corresponding to the current step.
   * @param type - The type of form to retrieve the step for.
   *
   * @returns An array of FormStep objects that match the current step.
   *
   */
  getFormStep(type: 'IDEA' | 'BUG'): FormStep[] {
    if (type === 'IDEA') {
      return this.form_idea_steps.filter((step: FormStep): boolean => step.id === this.current_steps.idea_suggestion);
    } else {
      return this.form_bug_steps.filter((step: FormStep): boolean => step.id === this.current_steps.bug_report);
    }
  }
}
