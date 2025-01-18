import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {DataHolderService} from "../../../services/data/data-holder.service";
import {HeaderComponent} from "../../../structure/header/header.component";
import {ReactiveFormsModule} from "@angular/forms";
import {SidebarComponent} from "../../../structure/sidebar/sidebar.component";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {Feature, feature_list, Tag, tags} from "../../../services/types/navigation/WishlistTags";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {
  faClock,
  faHashtag, faInbox,
  faLightbulb,
  faSearch, faThumbsUp,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import {animate, style, transition, trigger} from "@angular/animations";

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
  styleUrl: './wishlist.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class WishlistComponent implements AfterViewInit {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faLightbulb: IconDefinition = faLightbulb;
  protected readonly faHashtag: IconDefinition = faHashtag;
  protected readonly faInbox: IconDefinition = faInbox;
  protected readonly faThumbsUp: IconDefinition = faThumbsUp;
  protected readonly faClock: IconDefinition = faClock;

  @ViewChild('Divider') protected divider!: ElementRef<HTMLDivElement>
  @ViewChild('WishlistContainer') protected wishlistContainer!: ElementRef<HTMLDivElement>

  protected readonly feature_list: Feature[] = feature_list;
  protected readonly tags: Tag[] = tags;
  protected allItemsDisabled: boolean = feature_list.every(f => !f.enabled);

  constructor(protected dataService: DataHolderService, private translate: TranslateService) {
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
   * Filters the features based on the provided tag ID.
   *
   * This method updates the `enabled` property of each feature in the `feature_list`
   * based on the provided tag ID. If the tag ID is 1, all features are enabled.
   * Otherwise, only features with a matching tag ID are enabled.
   *
   * @param tagId - The ID of the tag to filter features by. If null, no features are enabled.
   */
  filterFeatures(tagId: number | null): void {
    feature_list.forEach(f => {
      f.enabled = tagId === 1 || f.tag_id === tagId;
    });

    tags.forEach(t => {
      t.isActive = t.id === tagId;
    });

    this.allItemsDisabled = feature_list.every(f => !f.enabled);
  }

  /**
   * Filters the features based on the search input value.
   *
   * This method updates the `enabled` property of each feature in the `feature_list`
   * based on whether the feature's name or description includes the search input value.
   * The search input value is converted to lowercase for case-insensitive comparison.
   * If no features match the search input value, the `allItemsDisabled` property is set to true.
   *
   * @param event - The keyboard event triggered by typing in the search input field.
   */
  searchFeatures(event: KeyboardEvent): void {
    const searchValue: string = (event.target as HTMLInputElement).value.toLowerCase();
    feature_list.forEach(f => {
      f.enabled = this.translate.instant(f.name).toLowerCase().includes(searchValue) || this.translate.instant(f.desc).toLowerCase().includes(searchValue);
    });

    this.allItemsDisabled = feature_list.every(f => !f.enabled);
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
