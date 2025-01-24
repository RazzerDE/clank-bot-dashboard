import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {SliderItems} from "../../../../services/types/landing-page/SliderItems";
import {AnimationService} from "../../../../services/animation/animation.service";
import {TranslatePipe} from "@ngx-translate/core";
import {ApiService} from "../../../../services/api/api.service";
import {GeneralStats} from "../../../../services/types/Statistics";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {forkJoin} from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'landing-section-intro',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgClass,
    TranslatePipe
  ],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss'
})
export class IntroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('slider') protected slider!: ElementRef<HTMLDivElement>;
  protected readonly window: Window = window;
  protected slider_items: SliderItems[] = [];
  protected duplicatedItems: SliderItems[] = [];  // show duplicated items in slider for infinite loop

  protected currentTranslate: number = 0;
  protected transitionSpeed: number = 30;  // in milliseconds
  protected isResetting: boolean = false;  // to avoid visual jump when resetting the position
  protected isPaused: boolean = false;

  private slidingInterval: any;  // datatype can't be imported

  constructor(private animations: AnimationService, private apiService: ApiService,
              protected dataService: DataHolderService) {
    this.getBotStats();
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * - Duplicates the slider items to create an infinite loop effect.
   * - Starts the sliding animation for the slider.
   * - Initiates the star animation for the intro section.
   */
  ngAfterViewInit(): void {
    // start star animation for intro
    this.animations.setCanvasID('intro-canvas', 'star');
    this.animations.startAnimation('intro-canvas');
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * - Clears the sliding interval to stop the sliding animation.
   */
  ngOnDestroy(): void {
    if (this.slidingInterval) {
      clearInterval(this.slidingInterval);
    }
  }

  /**
   * Fetches general bot statistics and also some famous guilds from the API and updates the placeholder data correctly.
   */
  getBotStats(): void {
    // Fetch both general stats and guild usage
    forkJoin({
      guildUsage: this.apiService.getGuildUsage(25), generalStats: this.apiService.getGeneralStats()
    }).subscribe({
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
   * Starts the sliding animation for the slider.
   * - Sets an interval to continuously call the `slide` method.
   * - Pauses the sliding when `isPaused` is true.
   */
  startSliding(): void {
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
  slide(): void {
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
  activeSlide(event: MouseEvent): void {
    const sliderItems: NodeListOf<HTMLDivElement> = this.slider.nativeElement.querySelectorAll('.slider-item');
    sliderItems.forEach((item: Element) => {
      if (event.type == 'mouseenter') {
        (item as HTMLElement).style.filter = 'grayscale(100%)';
      } else {
        (item as HTMLElement).style.filter = 'none';
      }
    });
  }
}
