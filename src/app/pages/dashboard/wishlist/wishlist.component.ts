import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {DataHolderService} from "../../../services/data/data-holder.service";
import {HeaderComponent} from "../../../structure/header/header.component";
import {ReactiveFormsModule} from "@angular/forms";
import {SidebarComponent} from "../../../structure/sidebar/sidebar.component";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {Feature, Tag} from "../../../services/types/navigation/WishlistTags";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {
  faClock,
  faHashtag, faInbox,
  faLightbulb,
  faSearch, faThumbsUp,
  IconDefinition
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
    FaIconComponent,
    NgOptimizedImage
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements AfterViewInit {
  protected isDev: boolean = false;
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faLightbulb: IconDefinition = faLightbulb;
  protected readonly faHashtag: IconDefinition = faHashtag;
  protected readonly faInbox: IconDefinition = faInbox;
  protected readonly faThumbsUp: IconDefinition = faThumbsUp;
  protected readonly faClock: IconDefinition = faClock;

  @ViewChild('Divider') protected divider!: ElementRef<HTMLDivElement>
  @ViewChild('WishlistContainer') protected wishlistContainer!: ElementRef<HTMLDivElement>

  protected tags: Tag[] = [
    { id: 1, name: "WISHLIST_TAG_FEATURES", isActive: true },
    { id: 2, name: 'Support-Tool', isActive: false },
    { id: 3, name: 'Security-System', isActive: false },
    { id: 4, name: 'WISHLIST_TAG_GIVEAWAYS', isActive: false },
    { id: 5, name: 'WISHLIST_TAG_MODULES', isActive: false }
  ];

  protected feature_list: Feature[] = [
    { name: 'Modernes Levelsystem', icon_url: "assets/img/icons/utility/star.png", tag_id: 5, votes: 10, dislikes: 4,
      created_at: '23.01.2025', desc: "› User sollen XP erhalten und Level aufsteigen, in dem sie sich auf dem Server aktiv beteiligen." },
    { name: 'Temp-Voice-System', icon_url: "assets/img/icons/utility/sound.png", tag_id: 5, votes: 3, dislikes: 0,
      created_at: '19.01.2025', desc: "› User sollen temporäre Voice-Channels erstellen können, die automatisch gelöscht werden." },
    { name: 'Live-Benachrichtigungen', icon_url: "assets/img/icons/utility/live.png", tag_id: 5, votes: 3, dislikes: 6,
      created_at: '19.01.2025', desc: "› Admins sollen YouTube/Twitch-Kanäle festlegen können, wobei der Bot Live-Infos rausschickt." },
    { name: 'Willkommens-Nachrichten', icon_url: "assets/img/icons/utility/wave.png", tag_id: 5, votes: 5, dislikes: 21,
      created_at: '19.01.2025', desc: "› Server sollten stark personalisierte Willkommens-Nachrichten & Join-Rollen festlegen können." },
  ]

  constructor(protected dataService: DataHolderService) {
    this.dataService.hideGuildSidebar = false;
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * This method sets the responsive height of the wishlist container by calling the setResponsiveHeight method.
   */
  ngAfterViewInit(): void {
    this.setResponsiveHeight();
  }

  /**
   * Adjusts the height of the wishlist container to match the height of the divider element.
   * This method is triggered on window resize and fullscreen change events.
   *
   */
  @HostListener('window:resize', ['$event'])
  @HostListener('document:fullscreenchange', ['$event'])
  protected setResponsiveHeight(): void {
    if (this.divider && this.wishlistContainer && this.divider.nativeElement.offsetHeight > 0) {
      this.wishlistContainer.nativeElement.style.height = `${this.divider.nativeElement.offsetHeight}px`;
    }

    this.dataService.isLoading = false;
  }


}
