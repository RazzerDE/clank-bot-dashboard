import { Component } from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {
  DiscordMarkdownComponent
} from "../../../../structure/util/modal/templates/discord-markdown/discord-markdown.component";
import {Giveaway} from "../../../../services/types/Events";
import {EmbedConfig} from "../../../../services/types/Config";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faPanorama} from "@fortawesome/free-solid-svg-icons/faPanorama";
import {FormsModule} from "@angular/forms";
import {faCamera} from "@fortawesome/free-solid-svg-icons/faCamera";
import {faIcons} from "@fortawesome/free-solid-svg-icons/faIcons";
import {faBrush} from "@fortawesome/free-solid-svg-icons/faBrush";
import {faSave} from "@fortawesome/free-solid-svg-icons/faSave";
import {faShuffle} from "@fortawesome/free-solid-svg-icons/faShuffle";

@Component({
  selector: 'app-embed-design',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    DiscordMarkdownComponent,
    FaIconComponent,
    FormsModule
  ],
  templateUrl: './embed-design.component.html',
  styleUrl: './embed-design.component.scss'
})
export class EmbedDesignComponent {
  protected initGiveaway: Giveaway = { creator_id: '', creator_name: '', creator_avatar: '', gw_req: null, prize: '',
    channel_id: null, end_date: new Date(Date.now() + 10 * 60 * 6000), winner_count: 1, participants: 0, start_date: null };
  protected embed_config: EmbedConfig = { color_code: '#706fd3', thumbnail_url: 'https://i.imgur.com/8eajG1v.gif',
    banner_url: null, emoji_reaction: this.dataService.getEmojibyId('<a:present:873708141085343764>') }

  constructor(protected dataService: DataHolderService) {
    this.dataService.isLoading = false;
  }

  protected readonly faPanorama = faPanorama;
  protected readonly faCamera = faCamera;
  protected readonly faIcons = faIcons;
  protected readonly faBrush = faBrush;
  protected readonly faSave = faSave;
  protected readonly faShuffle = faShuffle;
}
