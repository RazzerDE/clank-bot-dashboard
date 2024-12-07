import { Component } from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {feature_items} from "./types/feature-item";

@Component({
  selector: 'landing-section-features',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgClass
  ],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss'
})
export class LandingSectionFeaturesComponent {

  /**
   * Toggles fullscreen mode for a video element.
   *
   * @param {string} video_id - The ID of the video element to toggle fullscreen.
   * @param {Event} [event] - Optional event parameter. If provided, requests fullscreen mode.
   */
  toggleFullscreen(video_id: string, event?: Event): void {
    const videoElement = document.getElementById(video_id) as HTMLVideoElement;
    if (event) {
      videoElement.requestFullscreen().then();
    } else {
      videoElement.classList.toggle('cursor-pointer');
    }

  }

  protected readonly feature_items = feature_items;
}
