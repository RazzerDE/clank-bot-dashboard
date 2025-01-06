import {AfterViewInit, Component} from '@angular/core';
import {DataHolderService} from "../../../services/data/data-holder.service";
import {HeaderComponent} from "../../../structure/header/header.component";
import {NgClass} from "@angular/common";
import {SidebarComponent} from "../../../structure/sidebar/sidebar.component";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons/faChevronRight";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {RouterLink} from "@angular/router";
import {faDiscord} from "@fortawesome/free-brands-svg-icons";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    NgClass,
    FaIconComponent,
    RouterLink
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements AfterViewInit {

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
    this.dataService.isLoading = false;
  }

  protected readonly faChevronRight = faChevronRight;
  protected readonly faDiscord = faDiscord;
}
