import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {faBullhorn, faPencil, faSearch, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {TableConfig} from "../../../../services/types/Config";
import {TicketSnippet} from "../../../../services/types/Tickets";
import {NgOptimizedImage} from "@angular/common";
import {MarkdownPipe} from "../../../../pipes/markdown/markdown.pipe";

@Component({
  selector: 'app-ticket-snippets',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    DataTableComponent,
    FaIconComponent,
    NgOptimizedImage,
    MarkdownPipe,
  ],
  templateUrl: './ticket-snippets.component.html',
  styleUrl: './ticket-snippets.component.scss'
})
export class TicketSnippetsComponent {

  protected readonly faBullhorn: IconDefinition = faBullhorn;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faPlus: IconDefinition = faPlus;
  protected readonly faPencil: IconDefinition = faPencil;
  protected readonly faXmark: IconDefinition = faXmark;
  protected dataLoading: boolean = false; // TODO

  protected snippets: TicketSnippet[] = [
    { name: 'Willkommen', desc: 'Begrüßt neue Nutzer im Support und gibt ihnen eine Einführung in die wichtigsten Funktionen und Regeln des Servers.' },
    { name: 'FAQ', desc: 'Antwortet auf häufig gestellte Fragen.' },
    { name: 'Regeln', desc: 'Erklärt die wichtigsten Serverregeln, um ein harmonisches Miteinander zu gewährleisten.' },
    { name: 'Support', desc: 'Bietet Unterstützung bei technischen Problemen und beantwortet spezifische Fragen.' },
    { name: 'Events', desc: 'Informiert über bevorstehende Veranstaltungen und gibt Details zu Zeit, Ort und Teilnahmebedingungen.' },
    { name: 'Moderation', desc: 'Erklärt die Moderationsrichtlinien.' },
    { name: 'Feedback', desc: 'Ermöglicht das Einreichen von Feedback, um den Server zu verbessern.' },
    { name: 'Updates', desc: 'Teilt die neuesten Updates und Änderungen, einschließlich neuer Features und Bugfixes.' }
  ];
  protected filteredSnippets: TicketSnippet[] = this.snippets;

  constructor(protected dataService: DataHolderService) {
    document.title = 'Ticket Snippets ~ Clank Discord-Bot';

    this.dataService.isLoading = false; // TODO
    this.dataService.selectedSnippet = this.snippets[0]; // TODO replace with real data
  }

  onSnippetSelect(snippet: TicketSnippet): void {
    this.dataService.selectedSnippet = snippet;  // TODO
  }

  /**
   * Getter for the table configuration used in the Ticket Snippets component.
   * This configuration defines the structure and behavior of the table displayed
   * in the component, including columns, rows, and action buttons.
   *
   * @returns {TableConfig} The configuration object for the table.
   */
  protected get tableConfig(): TableConfig {
    return {
      type: "SUPPORT_SNIPPETS",
      list_empty: 'PLACEHOLDER_SNIPPET_EMPTY',
      dataLoading: this.dataLoading,
      rows: this.filteredSnippets,
      columns: [
        { width: 80, name: '📜 ~ Snippet-Name' },
        { width: 20, name: 'PLACEHOLDER_ACTION' }
      ],
      action_btn: [
        {
          color: 'blue',
          icon: this.faPencil,
          size: 'lg',
          action: (snippet: TicketSnippet): void => {} // TODO
        },
        {
          color: 'red',
          icon: this.faXmark,
          size: 'xl',
          action: (snippet: TicketSnippet): void => {} // TODO
        }
      ],
      actions: []
    };
  };

}
