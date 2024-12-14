import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {HeaderComponent} from "./header/header.component";
import {FooterComponent} from "./footer/footer.component";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {nav_items} from "./header/types/LNavigationItem";
import {LandingSectionFeaturesComponent} from "./sections/features/features.component";
import {AnimationService} from "../../services/animation/animation.service";
import {SliderItems} from "../../services/types/landing-page/SliderItems";

@Component({
  selector: 'landing-page',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    NgOptimizedImage,
    RouterLink,
    LandingSectionFeaturesComponent,
    NgClass
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('slider') protected slider!: ElementRef<HTMLDivElement>;
  protected readonly window: Window = window;
  // TODO: Change with real data
  protected readonly nav_items = nav_items;
  protected slider_items: SliderItems[] = [
    {
      image_url: 'https://cdn.discordapp.com/icons/671065574821986348/313528b52bc81e964c3bd6c1bb406b9b.png?size=64',
      guild_name: 'Bl4cklist',
      guild_invite: 'https://discord.gg/bl4cklist'
    },
    {
      image_url: 'https://cdn.discordapp.com/icons/616655040614236160/a_b324dc6561660fd147e1cb7e04086b65.gif?size=64',
      guild_name: 'Bl4cklist',
      guild_invite: 'https://discord.gg/bl4cklist'
    },
    {
      image_url: 'https://cdn.discordapp.com/icons/1021914804920795227/3165a5395e4b5d7624cc86cfb99edba8.png?size=64',
      guild_name: 'Bl4cklist',
      guild_invite: 'https://discord.gg/bl4cklist'
    },
    {
      image_url: 'https://cdn.discordapp.com/icons/1157256410346823770/de2a75faa71b05a2685fc6c916d81d12.webp?size=64',
      guild_name: 'Bl4cklist',
      guild_invite: 'https://discord.gg/bl4cklist'
    },
    {
      image_url: 'https://cdn.discordapp.com/icons/609407060194623558/8ab37bda41a8c1ea4a48d10056b34605.webp?size=64',
      guild_name: 'Bl4cklist',
      guild_invite: 'https://discord.gg/bl4cklist'
    },
    {
      image_url: 'https://cdn.discordapp.com/avatars/327176944640720906/a_c261a382dc3b0ebe95d6304eb452c854.gif?size=64',
      guild_name: 'Bl4cklist',
      guild_invite: 'https://discord.gg/bl4cklist'
    },
    {
      image_url: 'https://cdn.discordapp.com/icons/931260304208330762/b5b2937692f640eca367b6001a90c3f0.webp?size=64',
      guild_name: 'Bl4cklist',
      guild_invite: 'https://discord.gg/bl4cklist'
    },
    {
      image_url: 'https://cdn.discordapp.com/icons/336642139381301249/3aa641b21acded468308a37eef43d7b3.webp?size=64',
      guild_name: 'Bl4cklist',
      guild_invite: 'https://discord.gg/bl4cklist'
    },
    {
      image_url: 'https://cdn.discordapp.com/icons/616655040614236160/a_b324dc6561660fd147e1cb7e04086b65.gif?size=64',
      guild_name: 'Bl4cklist',
      guild_invite: 'https://discord.gg/bl4cklist'
    },
    {
      image_url: 'https://cdn.discordapp.com/icons/787672220503244800/53fb0a8ba438e4a2420e0a8b7ea2c179.png?size=64',
      guild_name: 'Test',
      guild_invite: 'https://discord.gg/test'
    },
    {
      image_url: 'https://cdn.discordapp.com/icons/787672220503244800/53fb0a8ba438e4a2420e0a8b7ea2c179.png?size=64',
      guild_name: 'Test',
      guild_invite: 'https://discord.gg/test'
    }
  ];
  protected duplicatedItems: SliderItems[] = [];  // show duplicated items in slider for infinite loop

  protected currentTranslate = 0;
  protected transitionSpeed = 30;  // in milliseconds
  protected isResetting: boolean = false;  // to avoid visual jump when resetting the position
  protected isPaused: boolean = false;

  private slidingInterval: any;  // datatype can't be imported

  constructor(private animations: AnimationService) {
    this.duplicatedItems = [...this.slider_items, ...this.slider_items];
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * - Duplicates the slider items to create an infinite loop effect.
   * - Starts the sliding animation for the slider.
   * - Initiates the star animation for the intro section.
   */
  ngAfterViewInit(): void {
    this.startSliding();

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
