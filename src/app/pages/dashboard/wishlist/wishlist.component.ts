import { Component } from '@angular/core';
import {DataHolderService} from "../../../services/data/data-holder.service";
import {HeaderComponent} from "../../../structure/header/header.component";
import {ReactiveFormsModule} from "@angular/forms";
import {SidebarComponent} from "../../../structure/sidebar/sidebar.component";
import {NgClass} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    HeaderComponent,
    ReactiveFormsModule,
    SidebarComponent,
    NgClass,
    TranslatePipe
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent {

  constructor(protected dataService: DataHolderService) {
    this.dataService.isLoading = false;
    this.dataService.hideGuildSidebar = false;
  }

}
