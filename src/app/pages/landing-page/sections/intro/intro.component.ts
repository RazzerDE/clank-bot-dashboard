import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {isPlatformBrowser, NgOptimizedImage} from "@angular/common";
import {SliderItems} from "../../../../services/types/landing-page/SliderItems";
import {TranslatePipe} from "@ngx-translate/core";
import {ApiService} from "../../../../services/api/api.service";
import {GeneralStats} from "../../../../services/types/Statistics";
import {forkJoin, Subscription} from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {AnimationService} from "../../../../services/animation/animation.service";

@Component({
    selector: 'landing-section-intro',
    imports: [
        NgOptimizedImage,
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private animationService: AnimationService,
              private apiService: ApiService, protected dataService: DataHolderService, private ngZone: NgZone) {
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
    if (isPlatformBrowser(this.platformId) && window.innerWidth > 700 && window.innerHeight > 900) {
        this.animationService.setCanvasID('intro-canvas', 'star');
        this.animationService.startAnimation('intro-canvas');
    }
  }

  /**
   * Angular lifecycle hook that is called after the component is initialized.
   *
   * Sets the loading state and fetches bot statistics only in the browser environment.
   * If running on the server, sets placeholder statistics and disables the loader.
   */
  ngOnInit(): void {
    this.dataService.isLoading = false;

    // only fetch bot stats if we are in the browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.getBotStats();
    } else {
      this.setPlaceholderStats();
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
   * Fetches bot statistics and guild usage data from the API.
   *
   * - Sets the loading state to true while data is being fetched.
   * - Uses forkJoin to request both guild usage and general statistics in parallel.
   * - On success, updates the slider items and bot statistics, starts the slider animation,
   *   and hides the loader once the background image is loaded.
   * - On error, disables the loading state.
   */
  private getBotStats(): void {
    this.dataService.isLoading = true;
    this.subscription = forkJoin({guildUsage: this.apiService.getGuildUsage(25),
                                  generalStats: this.apiService.getGeneralStats()}).subscribe({
        next: async ({guildUsage, generalStats}: { guildUsage: SliderItems[], generalStats: GeneralStats }): Promise<void> => {
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
          await this.hideLoaderWhenReady();
        },
        error: (_err: HttpErrorResponse): void => { this.dataService.isLoading = false; }
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
   *
   * - Sets an interval to continuously call the `slide` method.
   * - Pauses the sliding when `isPaused` is true.
   */
  private startSliding(): void {
    this.ngZone.runOutsideAngular((): void => {
      this.slidingInterval = setInterval((): void => {
        if (!this.isPaused) {
          this.ngZone.run((): void => this.slide());
        }
      }, this.transitionSpeed);
    });
  }

  /**
   * Slides the items in the slider to the left.
   *
   * - Calculates the total width of the slider items.
   * - Moves the slider to the left by decreasing the `currentTranslate` value.
   * - Resets the position to avoid a visual jump when the slider has moved past the first set of items.
   * - Uses `setTimeout` to re-enable smooth transition after resetting the position.
   */
  private slide(): void {
    const sliderWidth: number = this.slider_items.length * (50 + 30); // icon width + gap
    this.currentTranslate -= 1;  // Move slider to the left

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
   *
   * - Applies a grayscale filter to all slider items when the mouse enters an item.
   * - Removes the grayscale filter when the mouse leaves an item.
   *
   * @param event - The mouse event triggered by entering or leaving a slider item.
   */
  protected activeSlide(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) { return; } // only run in browser

    const sliderItems: NodeListOf<HTMLDivElement> = this.slider.nativeElement.querySelectorAll('.slider-item');
    sliderItems.forEach((item: Element): void => {
      if (event.type == 'mouseenter') {
        (item as HTMLElement).style.filter = 'grayscale(100%)';
      } else {
        (item as HTMLElement).style.filter = 'none';
      }
    });
  }

  /**
   * Checks if the background image of the intro banner is fully loaded.
   * Uses a temporary img element to preload the background image.
   *
   * @returns Promise that resolves when background image is loaded
   */
  private checkBackgroundImageLoaded(): Promise<void> {
    return new Promise((resolve): void => {
      if (!isPlatformBrowser(this.platformId)) { resolve(); return; }

      const bannerElement: HTMLElement | null = document.getElementById('discord-bot');
      if (!bannerElement) { resolve(); return; }

      // Get computed background-image URL
      const computedStyle: CSSStyleDeclaration = window.getComputedStyle(bannerElement);
      const backgroundImage: string = computedStyle.backgroundImage;
      const urlMatch: RegExpMatchArray | null = backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
      if (!urlMatch || !urlMatch[1]) { resolve(); return; }

      const img = new Image();  // Preload the background image
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Resolve anyway to prevent hanging

      img.loading = 'eager';
      img.fetchPriority = 'high';
      img.src = urlMatch[1];
    });
  }

  /**
   * Waits for both API data and background image to be loaded before hiding the loader.
   */
  private async hideLoaderWhenReady(): Promise<void> {
    try {
      await this.checkBackgroundImageLoaded();
      this.dataService.isLoading = false;
    } catch (error) {
      setTimeout((): void => { this.dataService.isLoading = false; }, 2000);
    }
  }
}
