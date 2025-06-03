import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TranslatePipe} from "@ngx-translate/core";
import {faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {Emoji, Role} from "../../../services/types/discord/Guilds";
import {NgClass} from "@angular/common";
import {DataHolderService} from "../../../services/data/data-holder.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {FormsModule} from "@angular/forms";
import {FaqAnswerComponent} from "./templates/faq-answer/faq-answer.component";
import {SupportThemeAddComponent} from "./templates/support-theme-add/support-theme-add.component";
import {RolePickerComponent} from "./templates/role-picker/role-picker.component";
import {SupportTheme, TicketAnnouncement, TicketSnippet} from "../../../services/types/Tickets";
import {SnippetAddComponent} from "./templates/snippet-add/snippet-add.component";
import {TicketAnnouncementComponent} from "./templates/ticket-announcement/ticket-announcement.component";
import {BlockedUser} from "../../../services/types/discord/User";
import {BlockedUserComponent} from "./templates/blocked-user/blocked-user.component";

@Component({
  selector: 'app-modal',
  imports: [
    FaIconComponent,
    TranslatePipe,
    NgClass,
    FormsModule,
    FaqAnswerComponent,
    SupportThemeAddComponent,
    RolePickerComponent,
    SnippetAddComponent,
    TicketAnnouncementComponent,
    BlockedUserComponent,
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  animations: [
    trigger('fadeAnimation', [
      state('hidden', style({
        opacity: 0
      })),
      state('visible', style({
        opacity: 1
      })),
      transition('hidden => visible', animate('200ms ease-in')),
      transition('visible => hidden', animate('200ms ease-out'))
    ]),
    trigger('slideAnimation', [
      state('hidden', style({
        transform: 'translateY(20px)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('hidden => visible', animate('300ms ease-out')),
      transition('visible => hidden', animate('200ms ease-in'))
    ])
  ]
})
export class ModalComponent implements AfterContentInit  {
  @Input() discordRoles: Role[] = [];
  @Input() emojis: Emoji[] | string[] = [];
  @Input() type: string = '';
  @Input() content: string = '';
  @Input() extra: Role[] = [];
  @Input() obj: TicketSnippet | BlockedUser = {} as TicketSnippet;
  @Input() theme: SupportTheme = {} as SupportTheme;
  @Input() announcement: TicketAnnouncement = { level: null, description: null, end_date: null };

  @Input() action: (selectedRole: HTMLCollectionOf<HTMLOptionElement>, useDelete?: boolean) => void = (): void => {};
  @Input() snippet_action: (snippet: TicketSnippet) => void = (): void => {};
  @Input() snippet_edit: (snippet: TicketSnippet) => void = (): void => {};

  protected isVisible: boolean = false;
  protected readonly faXmark: IconDefinition = faXmark;

  @ViewChild('roleModal') roleModal!: ElementRef<HTMLDivElement>;
  @ViewChild('roleModalContent') modalContent!: ElementRef<HTMLDivElement>;
  @ViewChild('roleBackdrop') roleBackdrop!: ElementRef<HTMLDivElement>;
  @ViewChild('secondSnippetAdd') secondSnippetAdd: SnippetAddComponent | undefined = undefined;

  constructor(protected dataService: DataHolderService, private cdr: ChangeDetectorRef) {}

  /**
   * Lifecycle hook that is called after the component's content has been fully initialized.
   * is used to avoid Runtime Error: ExpressionChangedAfterItWasCheckedError
   *
   */
  ngAfterContentInit(): void {
    this.cdr.detectChanges();
  }

  /**
   * Displays the modal by removing the `hidden` class from the modal and backdrop elements.
   */
  showModal(): void {
    this.isVisible = true;
    this.roleModal.nativeElement.classList.remove('hidden');
    this.roleBackdrop.nativeElement.classList.remove('hidden');
  }

  /**
   * Hides the modal by adding the `hidden` class to the modal and backdrop elements.
   */
  hideModal(): void {
    this.isVisible = false;
    setTimeout((): void => {
      this.roleModal.nativeElement.classList.add('hidden');
      this.roleBackdrop.nativeElement.classList.add('hidden');
    }, 300);
  }

  /**
   * Checks if a given role ID is mentioned in the `extra` roles.
   *
   * This method verifies whether the provided `role_id` exists in the `extra` array.
   *
   * @param role_id - The ID of the role to check.
   * @returns `true` if the role ID is found in the `extra` array, otherwise `false`.
   */
  isDefaultMentioned(role_id: string): boolean {
    return (this.extra && this.extra.some(extraRole => extraRole.id === role_id))
  }

  /**
   * Determines whether a second modal should be displayed.
   *
   * @returns `true` if a second modal should be displayed, otherwise `false`.
   */
  protected showSecondModal(): boolean {
    return (this.type.endsWith('ADD') || this.type.endsWith('EDIT')) && !this.type.includes('TEAMLIST')
  }
}
