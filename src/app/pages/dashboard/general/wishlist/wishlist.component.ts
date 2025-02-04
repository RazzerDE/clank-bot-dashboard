import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {
  faClock,
  faHashtag, faInbox,
  faLightbulb,
  faSearch, faThumbsUp, faXmark,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import {animate, style, transition, trigger} from "@angular/animations";
import { HttpErrorResponse } from "@angular/common/http";
import {faBug} from "@fortawesome/free-solid-svg-icons/faBug";
import {RouterLink} from "@angular/router";
import {Subscription} from "rxjs";
import {
  CooldownFeatures,
  Feature,
  feature_list,
  FeatureData, FeatureVote, FeatureVotes,
  Tag,
  tags
} from "../../../../services/types/navigation/WishlistTags";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {ApiService} from "../../../../services/api/api.service";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";

@Component({
    selector: 'app-wishlist',
  imports: [
    ReactiveFormsModule,
    NgClass,
    TranslatePipe,
    FaIconComponent,
    NgOptimizedImage,
    RouterLink,
    PageThumbComponent,
    DashboardLayoutComponent
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
        ]),
        trigger('fadeAnimation', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('300ms', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('300ms', style({ opacity: 0 }))
            ])
        ])
    ]
})
export class WishlistComponent implements AfterViewInit, OnDestroy {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faLightbulb: IconDefinition = faLightbulb;
  protected readonly faHashtag: IconDefinition = faHashtag;
  protected readonly faInbox: IconDefinition = faInbox;
  protected readonly faThumbsUp: IconDefinition = faThumbsUp;
  protected readonly faClock: IconDefinition = faClock;
  protected readonly faBug: IconDefinition = faBug;
  protected readonly faXmark: IconDefinition = faXmark;
  protected isOnCooldown: CooldownFeatures[] = [];

  @ViewChild('Divider') protected divider!: ElementRef<HTMLDivElement>
  @ViewChild('WishlistContainer') protected wishlistContainer!: ElementRef<HTMLDivElement>
  @ViewChild('AlertContent') protected alertContent!: ElementRef<HTMLDivElement>

  protected feature_list: Feature[] = feature_list;
  protected tags: Tag[] = tags;
  protected allItemsDisabled: boolean = feature_list.every(f => !f.enabled);
  private subscriptions: Subscription[] = [];

  constructor(protected dataService: DataHolderService, private translate: TranslateService, private apiService: ApiService) {
    this.dataService.hideGuildSidebar = false;
    this.dataService.showAlertBox = false;
  }

  /**
   * Lifecycle hook that is called after Angular has fully initialized a component's view.
   *
   * This method sets the responsive height of the wishlist container and retrieves the feature votes
   * from the server. It is called once after the component's view has been initialized.
   */
  ngAfterViewInit(): void {
    this.setResponsiveHeight();
    this.getFeatureVotes();
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   *
   * This method unsubscribes from all active subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * Sends a vote for a feature.
   *
   * This method sends a vote for a feature to the server. It first checks if the user is logged in
   * and if the feature is on cooldown. If the feature is on cooldown, it sets the loading state.
   * It then sends the vote data to the server and handles the response.
   *
   * @param feature_id - The ID of the feature to vote for.
   * @param vote - A boolean indicating whether the vote is positive (true) or negative (false).
   */
  sendFeatureVote(feature_id: number, vote: boolean): void {
    if (!this.dataService.profile || (this.dataService.profile && !this.dataService.profile.id)) { return; }
    const cooldownFeature: CooldownFeatures | undefined = this.isOnCooldown.find(c => c.featureId === feature_id);
    if (cooldownFeature) { cooldownFeature.isLoading = true; cooldownFeature.onCooldown = true; }

    const data: FeatureData = { featureId: feature_id, userId: this.dataService.profile!.id, vote: vote };
    const feature_vote: Subscription = this.apiService.sendFeatureVote(data).subscribe({
      next: (_data: any): void => {
        this.getFeatureVotes();
        if (cooldownFeature) { cooldownFeature.isLoading = false; }

        this.dataService.error_color = 'green';
        this.dataService.showAlert(this.translate.instant('SUCCESS_VOTE_TITLE'), this.translate.instant('SUCCESS_VOTE_DESC'));

        setTimeout((): void => { if (cooldownFeature) { cooldownFeature.onCooldown = false; } }, 5500);
      },
      error: (error: HttpErrorResponse): void => {
        this.dataService.error_color = 'red';

        if (error.status === 304) { // not modified
          this.dataService.showAlert(this.translate.instant('ERROR_VOTE_SAME_TITLE'), this.translate.instant('ERROR_VOTE_SAME_DESC'));
        } else {
          this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
        }

        if (cooldownFeature) { cooldownFeature.isLoading = false; }

        setTimeout((): void => {
          const cooldownFeature: CooldownFeatures | undefined = this.isOnCooldown.find(c => c.featureId === feature_id);
          if (cooldownFeature) { cooldownFeature.onCooldown = false; }
        }, 5500);
      }
    });

    this.subscriptions.push(feature_vote);
  }

  /**
   * Retrieves the feature votes from the server and updates the feature list with the retrieved votes.
   *
   * This method sends an HTTP GET request to the server to fetch the votes for each feature.
   * Upon receiving the response, it updates the `votes` and `dislikes` properties of each feature
   * in the `feature_list` based on the retrieved data. If an error occurs during the request,
   * it logs the error to the console.
   */
  getFeatureVotes(): void {
    const get_votes: Subscription = this.apiService.getFeatureVotes().subscribe({
      next: (votes: FeatureVotes): void => {
        this.feature_list.forEach(feature => {
          const voteData: FeatureVote | undefined = votes.featureVotes.find(vote => vote.id === feature.id);
          if (voteData) {
            feature.votes = voteData.votes;
            feature.dislikes = voteData.dislikes;
          }
        });

        if (this.isOnCooldown.length === 0) {
          this.isOnCooldown = votes.featureVotes.map(v => ({ featureId: v.id, onCooldown: false, isLoading: false }));
        }
        this.dataService.isLoading = false;
      },
      error: (_error: HttpErrorResponse): void => {
        this.dataService.error_color = 'red';
        this.dataService.showAlert(this.translate.instant('ERROR_VOTE_SAME_TITLE'), this.translate.instant('ERROR_VOTE_SAME_DESC'));
        this.dataService.isLoading = false;
      }
    });

    this.subscriptions.push(get_votes);
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
    feature_list.forEach(f => { f.enabled = tagId === 1 || f.tag_id === tagId; });

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
  }

  /**
   * Checks if a feature is currently on cooldown.
   *
   * This method determines if a feature with the given ID is on cooldown by checking
   * the `isOnCooldown` array for an entry with a matching feature ID and `onCooldown` set to true.
   *
   * @param featureId - The ID of the feature to check for cooldown status.
   * @returns A boolean indicating whether the feature is on cooldown.
   */
  isCooldownActive(featureId: number): boolean {
    return this.isOnCooldown.some(item => item.featureId === featureId && item.onCooldown);
  }

  /**
   * Checks if a feature is currently in a loading state.
   *
   * This method determines if a feature with the given ID is in a loading state by checking
   * the `isOnCooldown` array for an entry with a matching feature ID and `isLoading` set to true.
   *
   * @param featureId - The ID of the feature to check for loading status.
   * @returns A boolean indicating whether the feature is in a loading state.
   */
  isLoadingActive(featureId: number): boolean {
    return this.isOnCooldown.some(item => item.featureId === featureId && item.isLoading);
  }

  /**
   * Sorts the feature list by votes and alphabetically by name.
   *
   * This method sorts the `feature_list` array first by the number of votes in descending order.
   * If two features have the same number of votes, they are sorted alphabetically by their name.
   *
   * @returns The sorted array of features.
   */
  sortFeatureList(): Feature[] {
    // sort by "votes" and alphabetically by "name"
    return this.feature_list.sort((a, b) => {
      if (a.votes === b.votes) {
        return a.name.localeCompare(b.name);
      }
      return b.votes - a.votes;
    });
  }
}
