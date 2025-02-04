import { Component } from '@angular/core';
import {HeaderComponent} from "../../../../structure/header/header.component";
import {SidebarComponent} from "../../../../structure/sidebar/sidebar.component";
import {NgClass} from "@angular/common";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {TranslatePipe} from "@ngx-translate/core";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";

@Component({
  selector: 'app-teamlist',
  imports: [
    HeaderComponent,
    SidebarComponent,
    NgClass,
    TranslatePipe,
    PageThumbComponent
  ],
  templateUrl: './teamlist.component.html',
  styleUrl: './teamlist.component.scss'
})
export class TeamlistComponent {

  constructor(protected dataService: DataHolderService) {
    this.dataService.isLoading = false;
  }

}
