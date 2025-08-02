import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  QueryList,
  ViewChildren
} from '@angular/core';
import {isPlatformBrowser, NgClass, NgOptimizedImage} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {feature_items, FeatureItem, FeatureListItem} from '../../../../services/types/landing-page/feature-item';

@Component({
    selector: 'landing-section-features',
    imports: [
        NgOptimizedImage,
        NgClass,
        TranslatePipe
    ],
    templateUrl: './features.component.html',
    styleUrl: './features.component.scss'
})
export class LandingSectionFeaturesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('lazyVideo') private lazyVideos!: QueryList<ElementRef<HTMLVideoElement>>;
  private videoObserver: IntersectionObserver | null = null;

  protected readonly feature_items: FeatureItem[] = feature_items;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   *
   * Initializes the IntersectionObserver for lazy-loading videos if running in the browser.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initVideoObserver();
    }
  }

  /**
   * Angular lifecycle hook that is called when the component is destroyed.
   *
   * Cleans up the IntersectionObserver instance to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.videoObserver) {
      this.videoObserver.disconnect();
    }
  }

  /**
   * Angular lifecycle hook that is called after the component's view has been fully initialized.
   *
   * Registers all video elements with the IntersectionObserver for lazy loading,
   * ensuring this only runs in the browser environment.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.videoObserver) {
      setTimeout((): void => {
        this.lazyVideos.forEach(videoRef => {
          this.videoObserver?.observe(videoRef.nativeElement);
        });
      }, 100);
    }
  }

  /**
   * Initializes the IntersectionObserver for lazy-loading video elements.
   *
   * Observes each video and loads/plays it when it enters the viewport.
   * Unobserves the video after it has started playing to optimize performance.
   * Only triggers if the video source is not already set.
   */
  private initVideoObserver(): void {
    this.videoObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target as HTMLVideoElement;
          const source = video.querySelector('source') as HTMLSourceElement;

          if (source && !video.src) {
            video.src = source.dataset['src'] || '';
            video.load();
            video.play().catch(error => {
              console.warn('Video autoplay failed:', error);
            });

            this.videoObserver?.unobserve(video);
          }
        }
      });
    }, { rootMargin: '50px 0px',  threshold: 0.1 });
  }

  /**
   * Toggles fullscreen mode for a video element.
   *
   * @param {string} video_id - The ID of the video element to toggle fullscreen.
   * @param {Event} [event] - Optional event parameter. If provided, requests fullscreen mode.
   */
  protected toggleFullscreen(video_id: string, event?: Event): void {
    const videoElement: HTMLVideoElement | null = document.getElementById(video_id) as HTMLVideoElement;
    if (event) {
      videoElement.requestFullscreen().then();
    } else {
      videoElement.classList.toggle('cursor-pointer');
    }
  }

  /**
   * Track function for feature items to optimize @for loop performance.
   *
   * @param {number} index - The current index in the iteration
   * @param {FeatureItem} feature - The feature item object
   * @returns {string | number} Unique identifier for the feature
   */
  trackByFeature(index: number, feature: FeatureItem): string | number {
    return feature.video_id || index;
  }

  /**
   * Track function for menu items to optimize @for loop performance.
   *
   * @param {number} index - The current index in the iteration
   * @param {FeatureListItem} item - The menu item object
   * @returns {string | number} Unique identifier for the menu item
   */
  trackByMenuItem(index: number, item: FeatureListItem): string | number {
    return item.feature_name || index;
  }
}
