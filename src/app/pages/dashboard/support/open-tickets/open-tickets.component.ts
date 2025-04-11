import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {Ticket} from "../../../../services/types/Tickets";
import {DatePipe} from "../../../../pipes/date.pipe";
import {FormsModule} from "@angular/forms";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-open-tickets',
  imports: [DashboardLayoutComponent, NgOptimizedImage, TranslatePipe, NgClass, DatePipe, FormsModule],
  templateUrl: './open-tickets.component.html',
  styleUrl: './open-tickets.component.scss',
  animations: [
    trigger('ticketAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class OpenTicketsComponent implements AfterViewInit {
  @ViewChild('mainContainer') protected mainContainer!: ElementRef<HTMLDivElement>;
  protected containerHeight: number = 0;
  protected searchQuery: string = '';

  protected filteredTickets: Ticket[] = [];
  protected selectedTicket: Ticket | null = null;
  protected tickets: Ticket[] = [
    { id: '1', title: 'Discord Bot reagiert nicht', status: 0, creator: { id: '123', username: 'MaxMustermann' }, tag: 'Discord-Hilfe', creation_date: new Date('2025-04-01T10:30:00') },
    { id: '2', title: 'Fehlermeldung beim Starten', status: 1, creator: { id: '456', username: 'JuliaSchmidt' }, tag: 'Bl4cklsit Bots', creation_date: new Date('2025-03-28T14:45:00') },
    { id: '3', title: 'Berechtigungsproblem im Kanal', status: 2, creator: { id: '789', username: 'ThomasMüller' }, tag: 'Discord-Hilfe', creation_date: new Date('2025-03-25T09:15:00') },
    { id: '4', title: 'Bot antwortet nicht auf Befehle', status: 0, creator: { id: '101', username: 'SarahWeber' }, tag: 'Bl4cklsit Bots', creation_date: new Date('2025-03-20T16:20:00') },
    { id: '5', title: 'Musik-Feature funktioniert nicht', status: 1, creator: { id: '112', username: 'LukasHoffmann' }, tag: 'Bl4cklsit Bots', creation_date: new Date('2025-03-15T11:05:00') },
    { id: '6', title: 'Discord-Integration fehlerhaft', status: 2, creator: { id: '131', username: 'ErikaMusterfrau' }, tag: 'Discord-Hilfe', creation_date: new Date('2025-03-10T13:40:00') },
    { id: '7', title: 'Bot startet nicht nach Update', status: 0, creator: { id: '415', username: 'MarkusKeller' }, tag: 'Bl4cklsit Bots', creation_date: new Date('2025-03-05T08:55:00') },
    { id: '8', title: 'Timeout bei API-Anfragen', status: 1, creator: { id: '161', username: 'AnnaSchneider' }, tag: 'Allgemeine Frage', creation_date: new Date('2025-02-28T17:30:00') },
    { id: '9', title: 'Bot sendet keine Nachrichten', status: 2, creator: { id: '718', username: 'PeterFischer' }, tag: 'Bl4cklsit Bots', creation_date: new Date('2025-02-25T12:10:00') },
    { id: '10', title: 'Fehler bei der Benutzeranmeldung', status: 0, creator: { id: '192', username: 'LauraMeier' }, tag: 'Account verloren', creation_date: new Date('2025-02-20T15:25:00') },
  ] as Ticket[];

  constructor(protected dataService: DataHolderService) {
    document.title = 'Open Tickets ~ Clank Discord-Bot';
    this.dataService.isLoading = false;

    this.tickets = this.sortTickets();
    this.filteredTickets = [...this.tickets];
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * It calculates the height of the main container element.
   */
  ngAfterViewInit(): void {
    setTimeout((): void => { // avoid ExpressionChangedAfterItHasBeenCheckedError
      this.calculateContainerHeight();
    });
  }

  /**
   * Returns the list of tickets sorted by status and creation date.
   *
   * @returns {Ticket[]} A sorted array of tickets where:
   *   1. Open tickets (status 0) appear first, followed by claimed (status 1) and closed tickets (status 2)
   *   2. Within each status group, tickets are sorted by creation date (newest first)
   */
  protected sortTickets(): Ticket[] {
    return [...this.tickets].sort((a, b) => {
      // sort by status
      if (a.status !== b.status) {
        return a.status - b.status;
      }

      // sort by date after status
      return new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime();
    });
  }

  /**
   * Searches tickets based on the entered search query.
   * Filters tickets by tag, creator name, ID and title.
   */
  protected searchTickets(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredTickets = [...this.tickets];
      return;
    }

    const query: string = this.searchQuery.toLowerCase().trim();
    this.filteredTickets = this.tickets.filter(ticket => {
      return ticket.id.toLowerCase().includes(query.replace('#', '')) ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.creator.username.toLowerCase().includes(query) ||
        ticket.tag.toLowerCase().includes(query);
    });
  }

  /**
   * Selects a ticket and sets it as the currently selected ticket.
   *
   * @param {Ticket} ticket - The ticket to be selected.
   */
  selectTicket(ticket: Ticket): void {
    if (this.selectedTicket && this.selectedTicket.id === ticket.id) {
      this.selectedTicket = null; // Deselect if the same ticket
    } else {
      this.selectedTicket = ticket;
    }
  }

  /**
   * HostListener for window resize events.
   * Calls the calculateContainerHeight method to adjust the container height
   * whenever the window is resized.
   */
  @HostListener('window:resize')
  onResize(): void {
    this.calculateContainerHeight();
  }

  /**
   * Calculates the height of the main container element and updates the containerHeight property.
   * Is used to make the ticket list scrollable.
   */
  private calculateContainerHeight(): void {
    const sectionElement: HTMLDivElement = this.mainContainer.nativeElement;
    if (sectionElement) {
      const sectionRect: DOMRect = sectionElement.getBoundingClientRect();
      this.containerHeight = sectionRect.height;
    }
  }

}
