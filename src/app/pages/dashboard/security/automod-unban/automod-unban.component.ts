import { Component } from '@angular/core';
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {DragNDropComponent} from "../../../../structure/util/drag-n-drop/drag-n-drop.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {
  faHashtag,
  faRotateLeft,
  faShieldHalved,
  faTrash,
  faXmark,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import {faAt} from "@fortawesome/free-solid-svg-icons/faAt";
import {faVolumeHigh} from "@fortawesome/free-solid-svg-icons/faVolumeHigh";
import {initFeatures} from "../../../../services/types/Security";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {faSave} from "@fortawesome/free-solid-svg-icons/faSave";
import {SelectComponent} from "../../../../structure/util/modal/templates/select/select.component";
import {EventCard} from "../../../../services/types/Events";
import {faHandcuffs} from "@fortawesome/free-solid-svg-icons/faHandcuffs";

@Component({
  selector: 'app-automod-unban',
  imports: [
    AlertBoxComponent,
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent,
    NgClass,
    SelectComponent,
  ],
  templateUrl: './automod-unban.component.html',
  styleUrl: './automod-unban.component.scss'
})
export class AutomodUnbanComponent {
  protected readonly faHashtag: IconDefinition = faHashtag;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faShieldHalved: IconDefinition = faShieldHalved;
  protected readonly faXmark: IconDefinition = faXmark;

  protected event_cards: EventCard[] = [
    {title: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_0_TITLE', color: 'red',
      description: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_0_DESC'},
    {title: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_1_TITLE', color: 'blue',
      description: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_1_DESC'},
    {title: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_2_TITLE', color: 'rosa',
      description: 'PAGE_SECURITY_AUTOMOD_CONTAINER_ITEM_2_DESC'}
  ] as EventCard[];

  constructor(protected dataService: DataHolderService) {
    document.title = 'AutoMod-Settings - Clank Discord-Bot';
    this.dataService.isLoading = false;
  }

  protected readonly faTrash = faTrash;
  protected readonly faHandcuffs = faHandcuffs;
}
