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
import {faLightbulb, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faBug} from "@fortawesome/free-solid-svg-icons/faBug";
import {faClipboard} from "@fortawesome/free-solid-svg-icons/faClipboard";
import {faCircleInfo} from "@fortawesome/free-solid-svg-icons/faCircleInfo";
import {faListOl} from "@fortawesome/free-solid-svg-icons/faListOl";
import {faClipboardCheck} from "@fortawesome/free-solid-svg-icons/faClipboardCheck";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    NgClass,
    FaIconComponent,
    RouterLink,
    ReactiveFormsModule
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
  currentStep: number = 2;
  bugReportSent: boolean = false;

  steps = [
    { title: 'Art des Fehlers', isEmpty: () => this.formGroup.get('bugName')?.value === '' },
    { title: 'Verhalten', isEmpty: () => this.formGroup.get('bugExpected')!.value === '' || this.formGroup.get('bugActual')!.value === '' },
    { title: 'Reproduktion', isEmpty: () => this.formGroup.get('bugSteps')?.value === '' },
  ];

  formGroup = new FormGroup({
    bugName: new FormControl('', [Validators.required]),
    bugSteps: new FormControl('', [Validators.required]),
    bugExpected: new FormControl('', [Validators.required]),
    bugActual: new FormControl('', [Validators.required]),
  });

  @ViewChild('formBugReport') protected formBugReport!: ElementRef<HTMLDivElement>;
  @ViewChild('bugReportInfo') protected bugReportInfo!: ElementRef<HTMLParagraphElement>;
  protected formContainerHeight: string = 'auto';

  protected readonly faChevronRight: IconDefinition = faChevronRight;
  protected readonly faDiscord: IconDefinition = faDiscord;
  protected readonly faBug: IconDefinition = faBug;
  protected readonly faClipboardCheck: IconDefinition = faClipboardCheck;
  protected readonly faLightbulb: IconDefinition = faLightbulb;

  constructor(protected dataService: DataHolderService) {
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
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    } else {
      // send bug report
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
    if ((this.steps[step - 1] && this.steps[step - 1].isEmpty() && step >= this.currentStep) || this.bugReportSent) {
      return;
    }

    this.currentStep = step + 1;
  }

  /**
   * Checks if the current step in the form is valid.
   * @returns True if the current step is empty, otherwise false.
   */
  isFormValid(): boolean {
    return this.steps[this.currentStep - 1].isEmpty();
  }
}
