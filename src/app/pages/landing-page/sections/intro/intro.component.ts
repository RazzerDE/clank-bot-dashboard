import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {isPlatformBrowser, NgClass, NgOptimizedImage} from "@angular/common";
import {SliderItems} from "../../../../services/types/landing-page/SliderItems";
import {AnimationService} from "../../../../services/animation/animation.service";
import {TranslatePipe} from "@ngx-translate/core";
import {ApiService} from "../../../../services/api/api.service";
import {GeneralStats} from "../../../../services/types/Statistics";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {forkJoin, Subscription} from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'landing-section-intro',
    imports: [
        NgOptimizedImage,
        NgClass,
        TranslatePipe
    ],
    templateUrl: './intro.component.html',
    styleUrl: './intro.component.scss'
})
export class IntroComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('slider') protected slider!: ElementRef<HTMLDivElement>;
  protected readonly window?: Window;
  protected slider_items: SliderItems[] = [];
  protected duplicatedItems: SliderItems[] = [];  // show duplicated items in slider for infinite loop

  protected currentTranslate: number = 0;
  protected transitionSpeed: number = 30;  // in milliseconds
  protected isResetting: boolean = false;  // to avoid visual jump when resetting the position
  protected isPaused: boolean = false;

  private slidingInterval: any;  // datatype can't be imported
  private subscription: Subscription | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private animations: AnimationService,
              private apiService: ApiService, protected dataService: DataHolderService) {
    if (isPlatformBrowser(this.platformId)) {
      this.window = window;
    }
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * - Duplicates the slider items to create an infinite loop effect.
   * - Starts the sliding animation for the slider.
   * - Initiates the star animation for the intro section.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // start star animation for intro
      this.animations.setCanvasID('intro-canvas', 'star');
      this.animations.startAnimation('intro-canvas');
    }
  }

  /**
   * Angular lifecycle hook that is called after the component is initialized.
   *
   * Sets the loading state and fetches bot statistics only in the browser environment.
   * If running on the server, sets placeholder statistics and disables the loader.
   */
  ngOnInit(): void {
    this.dataService.isLoading = true;

    // only fetch bot stats if we are in the browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.getBotStats();
    } else {
      this.setPlaceholderStats();
      this.dataService.isLoading = false;
    }
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * - Clears the sliding interval to stop the sliding animation.
   * - Unsubscribes from the API request.
   */
  ngOnDestroy(): void {
    if (this.slidingInterval) {
      clearInterval(this.slidingInterval);
    }

    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  /**
   * Fetches general bot statistics and also some famous guilds from the API and updates the placeholder data correctly.
   */
  private getBotStats(): void {
    // Fetch both general stats and guild usage
    this.subscription = forkJoin({guildUsage: this.apiService.getGuildUsage(25),
                                  generalStats: this.apiService.getGeneralStats()})
      .subscribe({
        next: ({guildUsage, generalStats}: { guildUsage: SliderItems[], generalStats: GeneralStats }): void => {
          // Handle guild usage
          this.slider_items = guildUsage;
          this.duplicatedItems = [...this.slider_items, ...this.slider_items];
          this.startSliding();

          // Handle general stats
          this.dataService.bot_stats = {
            user_count: Number(generalStats.user_count).toLocaleString('de-DE'),
            guild_count: Number(generalStats.guild_count).toLocaleString('de-DE'),
            giveaway_count: Number(generalStats.giveaway_count).toLocaleString('de-DE'),
            ticket_count: Number(generalStats.ticket_count).toLocaleString('de-DE'),
            punish_count: Number(generalStats.punish_count).toLocaleString('de-DE'),
            global_verified_count: Number(generalStats.global_verified_count).toLocaleString('de-DE')
          };

          // Disable page Loader
          this.dataService.isLoading = false;
        },
        error: (_err: HttpErrorResponse): void => {
          this.dataService.isLoading = false;
        }
    });
  }

  /**
   * Sets placeholder statistics for server-side rendering (SSR).
   *
   * This method assigns default placeholder values to the bot statistics
   * to ensure the UI displays consistent data when actual API calls are not possible.
   */
  private setPlaceholderStats(): void {
    this.dataService.bot_stats = {
      user_count: '87.265', guild_count: '736', giveaway_count: '715', ticket_count: '1.382',
      punish_count: '521', global_verified_count: '16.767'
    };
  }

  /**
   * Starts the sliding animation for the slider.
   * - Sets an interval to continuously call the `slide` method.
   * - Pauses the sliding when `isPaused` is true.
   */
  private startSliding(): void {
    this.slidingInterval = setInterval(() => {
      if (!this.isPaused) { this.slide(); }
    }, this.transitionSpeed);
  }

  /**
   * Slides the items in the slider to the left.
   * - Calculates the total width of the slider items.
   * - Moves the slider to the left by decreasing the `currentTranslate` value.
   * - Resets the position to avoid a visual jump when the slider has moved past the first set of items.
   * - Uses `setTimeout` to re-enable smooth transition after resetting the position.
   */
  private slide(): void {
    const sliderWidth = this.slider_items.length * (50 + 30); // icon width + gap
    // Move slider to the left
    this.currentTranslate -= 1;

    // Check if we've moved past the first set of items
    if (Math.abs(this.currentTranslate) >= sliderWidth) {
      // Reset the position to avoid visual jump
      this.isResetting = true;
      this.currentTranslate = 0;

      // Use setTimeout to re-enable smooth transition
      setTimeout((): void => { this.isResetting = false; }, 0);
    }
  }

  /**
   * Handles the mouse enter and leave events for the slider items.
   * - Applies a grayscale filter to all slider items when the mouse enters an item.
   * - Removes the grayscale filter when the mouse leaves an item.
   *
   * @param event - The mouse event triggered by entering or leaving a slider item.
   */
  protected activeSlide(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) { return; } // only run in browser

    const sliderItems: NodeListOf<HTMLDivElement> = this.slider.nativeElement.querySelectorAll('.slider-item');
    sliderItems.forEach((item: Element) => {
      if (event.type == 'mouseenter') {
        (item as HTMLElement).style.filter = 'grayscale(100%)';
      } else {
        (item as HTMLElement).style.filter = 'none';
      }
    });
  }

  /**
   * Checks the visibility of a slider element and returns the appropriate TailwindCSS width class.
   * Only runs in the browser environment.
   *
   * @param element - The HTMLDivElement to check for visibility.
   * @returns A TailwindCSS width class based on the element's visibility.
   */
  protected checkVisibilityForSlider(element: HTMLDivElement): string {
    if (!isPlatformBrowser(this.platformId)) { return ''; } // only run in browser
    return element.checkVisibility() ? '!w-1/2' : '!w-full';
  }
}
