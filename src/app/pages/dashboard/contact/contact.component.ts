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
import {WizardStep, steps, FormStep} from "../../../services/types/Forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";

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
  protected currentStep: number = 2;
  protected bugReportSent: boolean = false;

  protected wizard_steps: WizardStep[] = [
    { title: 'WIZARD_STEP_FIRST', isEmpty: () => this.formGroup.get('bugName')?.value === '' },
    { title: 'WIZARD_STEP_SECOND', isEmpty: () => this.formGroup.get('bugExpected')!.value === '' || this.formGroup.get('bugActual')!.value === '' },
    { title: 'WIZARD_STEP_THIRD', isEmpty: () => this.formGroup.get('bugSteps')?.value === '' },
  ];
  protected form_steps = steps;
  protected formGroup: FormGroup = new FormGroup({
    bugName: new FormControl('', [Validators.required]),
    bugSteps: new FormControl('', [Validators.required]),
    bugExpected: new FormControl('', [Validators.required]),
    bugActual: new FormControl('', [Validators.required]),
  });

  @ViewChild('formBugReport') private formBugReport!: ElementRef<HTMLDivElement>;
  @ViewChild('bugReportInfo') protected bugReportInfo!: ElementRef<HTMLParagraphElement>;
  protected formContainerHeight: string = 'auto';

  protected readonly faChevronRight: IconDefinition = faChevronRight;
  protected readonly faDiscord: IconDefinition = faDiscord;

  constructor(protected dataService: DataHolderService, protected translate: TranslateService) {
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
      this.currentStep = 1;
    }, 0);

    // avoid flicker of bug report form
    setTimeout((): void => { this.dataService.isLoading = false }, 400);
  }

  /**
   * Advances the form to the next step or sends the bug report if on the last step.
   */
  sendBugReport(): void {
    // switch to next step in form
    if (this.currentStep < this.wizard_steps.length) {
      this.currentStep++;
    } else {
      // send bug report TODO
      console.log(this.formGroup.value);
      this.bugReportSent = true;
    }
  }

  /**
   * Toggles the form to the specified step if the step is not empty.
   * @param step - The step to switch to.
   */
  toggleStep(step: number): void {
    // don't go if step is empty using formGroup
    if ((this.wizard_steps[step - 1] && this.wizard_steps[step - 1].isEmpty() && step >= this.currentStep) ||
        this.bugReportSent) {
      return;
    }

    this.currentStep = step + 1;
  }

  /**
   * Checks if the current step in the form is valid.
   * @returns True if the current step is empty, otherwise false.
   */
  isFormValid(): boolean {
    return this.wizard_steps[this.currentStep - 1].isEmpty();
  }

  /**
   * Retrieves the form step corresponding to the current step.
   * @returns An array of FormStep objects that match the current step.
   */
  getFormStep(): FormStep[] {
    return this.form_steps.filter((step: FormStep): boolean => step.id === this.currentStep);
  }
}
