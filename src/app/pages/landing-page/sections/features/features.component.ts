import { Component } from '@angular/core';
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'landing-section-features',
  standalone: true,
  imports: [
    NgOptimizedImage
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

}
