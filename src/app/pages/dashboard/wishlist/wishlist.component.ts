import { Component } from '@angular/core';
import {DataHolderService} from "../../../services/data/data-holder.service";
import {HeaderComponent} from "../../../structure/header/header.component";
import {ReactiveFormsModule} from "@angular/forms";
import {SidebarComponent} from "../../../structure/sidebar/sidebar.component";
import {NgClass} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {Tag} from "../../../services/types/navigation/WishlistTags";
import {faLifeRing} from "@fortawesome/free-regular-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {
  faBars,
  faGift,
  faLightbulb,
  faSearch,
  faShieldHalved, faTools, IconDefinition
} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    HeaderComponent,
    ReactiveFormsModule,
    SidebarComponent,
    NgClass,
    TranslatePipe,
    FaIconComponent
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent {
  protected isDev: boolean = false;
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faLightbulb: IconDefinition = faLightbulb;

  protected tags: Tag[] = [
    { name: "WISHLIST_TAG_FEATURES", icon: faBars, isActive: true },
    { name: 'Support-Tool', icon: faLifeRing, isActive: false },
    { name: 'Security-System', icon: faShieldHalved, isActive: false },
    { name: 'WISHLIST_TAG_GIVEAWAYS', icon: faGift, isActive: false },
    { name: 'WISHLIST_TAG_MODULES', icon: faTools, isActive: false }
  ];

  constructor(protected dataService: DataHolderService) {
    this.dataService.isLoading = false;
    this.dataService.hideGuildSidebar = false;
  }
}
