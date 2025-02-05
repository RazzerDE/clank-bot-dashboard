import { Component } from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {TranslatePipe} from "@ngx-translate/core";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faFilter, faSearch, faXmark} from "@fortawesome/free-solid-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";

@Component({
  selector: 'app-teamlist',
    imports: [
        TranslatePipe,
        PageThumbComponent,
        DashboardLayoutComponent,
        FaIconComponent
    ],
  templateUrl: './teamlist.component.html',
  styleUrl: './teamlist.component.scss'
})
export class TeamlistComponent {

  constructor(protected dataService: DataHolderService) {
    this.dataService.isLoading = false;
  }

  protected readonly faSearch = faSearch;
  protected readonly faPlus = faPlus;
  protected readonly faFilter = faFilter;
  protected readonly faChevronDown = faChevronDown;
  protected readonly faXmark = faXmark;
}
