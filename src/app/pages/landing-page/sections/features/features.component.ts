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
  private visibilityObserver: IntersectionObserver | null = null;
  private fullscreenVideos: Set<string> = new Set<string>();
  private videoVisibilityMap: Map<HTMLVideoElement, number> = new Map<HTMLVideoElement, number>();
  private currentPlayingVideo: HTMLVideoElement | null = null;

  protected readonly feature_items: FeatureItem[] = feature_items;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Angular lifecycle hook that initializes the component.
   *
   * Sets up IntersectionObservers for lazy-loading and visibility tracking of videos,
   * but only when running in the browser (not on the server).
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initVideoObserver();
      this.initVideoVisibilityObserver();
    }
  }

  /**
   * Angular lifecycle hook that is called when the component is destroyed.
   *
   * Cleans up IntersectionObservers to prevent memory leaks and unnecessary event handling.
   */
  ngOnDestroy(): void {
    if (this.videoObserver) { this.videoObserver.disconnect(); }
    if (this.visibilityObserver) { this.visibilityObserver.disconnect(); }
  }

  /**
   * Angular lifecycle hook called after the component's view has been fully initialized.
   *
   * Registers all video elements with the IntersectionObservers for lazy loading and visibility tracking.
   * Uses a timeout to ensure that the QueryList of video elements is populated before observation begins.
   * Only executes in the browser environment.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout((): void => {
        this.lazyVideos.forEach(videoRef => {
          this.videoObserver?.observe(videoRef.nativeElement);
          this.visibilityObserver?.observe(videoRef.nativeElement);
        });
      }, 100);
    }
  }

  /**
   * Initializes the IntersectionObserver for lazy-loading videos.
   *
   * Observes video elements and loads their preview or full-quality source
   * when they enter the viewport. Once loaded, the observer unobserves the video
   * to prevent redundant loading. This improves performance by only loading videos
   * when they are likely to be viewed by the user.
   */
  private initVideoObserver(): void {
    this.videoObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target as HTMLVideoElement;
          const source = video.querySelector('source') as HTMLSourceElement;

          if (source && !video.src) {
            const previewUrl: string | undefined = source.dataset['previewSrc'];
            const fullUrl: string | undefined = source.dataset['src'];

            video.style.transform = 'translateZ(0)';
            video.style.willChange = 'transform';
            video.src = previewUrl || fullUrl || '';
            video.load();

            this.videoObserver?.unobserve(video);
          }
        }
      });
    }, { rootMargin: '50px 0px', threshold: 0.1 });
  }

  /**
   * Initializes the IntersectionObserver for tracking the visibility of video elements.
   *
   * This observer updates the visibility ratio of each video in the `videoVisibilityMap` when it enters or leaves the viewport.
   * If a video is no longer visible, it is removed from the map and paused if it was playing.
   * After each visibility change, the function determines which video should be playing based on the highest visibility ratio.
   *
   * This improves performance and user experience by ensuring only the most visible video plays at any time.
   */
  private initVideoVisibilityObserver(): void {
    this.visibilityObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;

        if (entry.isIntersecting) {
          this.videoVisibilityMap.set(video, entry.intersectionRatio);  // Store visibility ratio for this video
        } else {
          this.videoVisibilityMap.delete(video);  // Remove video from visibility map when not visible

          // Pause video if it's not visible and currently playing
          if (this.currentPlayingVideo === video) {
            video.pause();
            this.currentPlayingVideo = null;
          }
        }

        // Determine which video should be playing
        this.updateVideoPlayback();
      }); }, { rootMargin: '0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] });
  }

  /**
   * Updates video playback based on visibility.
   *
   * Determines which video element currently has the highest intersection ratio (i.e., is most visible in the viewport)
   * and ensures only that video is playing. If a different video becomes most visible, the previously playing video is paused
   * and the new one is played. This prevents multiple videos from playing simultaneously and optimizes user experience and performance.
   *
   * Called whenever the visibility of any observed video changes.
   */
  private updateVideoPlayback(): void {
    if (this.videoVisibilityMap.size === 0) { return; }

    // Find video with highest visibility ratio
    let mostVisibleVideo: HTMLVideoElement | null = null;
    let highestRatio: number = 0;

    this.videoVisibilityMap.forEach((ratio, video): void => {
      if (ratio > highestRatio && video.src) { highestRatio = ratio; mostVisibleVideo = video; }
    });

    // Only switch if the most visible video is different from current playing
    if (mostVisibleVideo && mostVisibleVideo !== this.currentPlayingVideo) {
      if (this.currentPlayingVideo) { this.currentPlayingVideo.pause(); }  // Pause current playing video

      // Play most visible video
      this.currentPlayingVideo = mostVisibleVideo;
      setTimeout((): void => { (mostVisibleVideo as HTMLVideoElement).play().catch(error =>
        { console.warn('Video autoplay failed:', error); })}, 5);
    }
  }

  /**
   * Toggles fullscreen mode for a video element.
   *
   * If an event is provided (e.g., user clicks to enter fullscreen), the function loads the full quality video
   * (if not already loaded), requests fullscreen, and removes the pointer cursor.
   * If no event is provided (e.g., user exits fullscreen), the function reverts the video to preview quality
   * and toggles the pointer cursor.
   *
   * @param video_id - The DOM id of the video element to toggle fullscreen for.
   * @param event - Optional event that triggers entering fullscreen mode.
   */
  protected toggleFullscreen(video_id: string, event?: Event): void {
    const videoElement: HTMLVideoElement | null = document.getElementById(video_id) as HTMLVideoElement;
    if (!videoElement) return;

    if (event) {
      // Load full quality version before going fullscreen
      if (!this.fullscreenVideos.has(video_id)) { this.switchVideoQuality(videoElement, video_id, true); }

      videoElement.requestFullscreen().then(() => {
        videoElement.classList.remove('cursor-pointer');
      }).catch(error => { console.warn('Fullscreen request failed:', error); });
    } else {
      if (!document.fullscreenElement) { this.switchVideoQuality(videoElement, video_id, false); }
      videoElement.classList.toggle('cursor-pointer');
    }
  }

  /**
   * Switches the video element between full quality and preview quality.
   *
   * If `toFullQuality` is true, loads the full quality video, otherwise reverts to preview.
   * Playback position and state are preserved.
   *
   * @param videoElement The video element to switch.
   * @param video_id The DOM id of the video element.
   * @param toFullQuality If true, load full quality; if false, revert to preview.
   */
  private switchVideoQuality(videoElement: HTMLVideoElement, video_id: string, toFullQuality: boolean): void {
    const source = videoElement.querySelector('source') as HTMLSourceElement;
    const fullUrl: string | undefined = source?.dataset['src'];
    const previewUrl: string | undefined = source?.dataset['previewSrc'];
    const targetUrl: string | undefined = toFullQuality ? fullUrl : previewUrl;
    if (!targetUrl) return;

    // Prevent unnecessary reload if already at desired quality
    if (targetUrl !== "/assets/" + videoElement.src.split("/assets/")[1]) {
      const currentTime: number = videoElement.currentTime;
      const wasPlaying: boolean = !videoElement.paused;

      if (toFullQuality) {
        videoElement.style.transform = 'translateZ(0)';
        videoElement.style.willChange = 'transform, opacity';
      }

      videoElement.src = targetUrl;
      videoElement.load();

      videoElement.addEventListener('loadeddata', (): void => {
        videoElement.currentTime = currentTime;
        if (wasPlaying) { videoElement.play().then(); }
        if (toFullQuality) { this.fullscreenVideos.add(video_id);
        } else {
          videoElement.style.willChange = 'auto';
          this.fullscreenVideos.delete(video_id);
        }
      }, { once: true });
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
