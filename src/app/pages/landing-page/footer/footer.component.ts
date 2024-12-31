import {Component, AfterViewInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import { faChevronUp, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {NgOptimizedImage} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {RouterLink} from "@angular/router";
import {AnimationService} from "../../../services/animation/animation.service";
import {TranslatePipe} from "@ngx-translate/core";
import { nav_items } from '../../../services/types/landing-page/LNavigationItem';

@Component({
  selector: 'landing-footer',
  standalone: true,
  imports: [
    NgOptimizedImage,
    FaIconComponent,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements AfterViewInit {
  @ViewChild('invite_btn')
  protected invite_btn!: ElementRef<HTMLAnchorElement>;
  protected faChevronUp: IconDefinition = faChevronUp;
  protected readonly nav_items = nav_items;

  constructor(private animations: AnimationService) {}

  ngAfterViewInit() {
    // start firefly animation for footer
    this.animations.setCanvasID('footer-canvas', 'firefly');
    this.animations.startAnimation('footer-canvas');
  }

  /**
   * Adjusts the margin-top of the content div to be responsive to the height of the CTA (footer) div.
   * This function is triggered on various fullscreen change events and window resize events.
   * It ensures that the layout remains consistent and responsive.
   *
   * @param _event - The event object (not used in the function but required for the HostListener).
   */
  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  @HostListener('window:resize', ['$event'])
  @HostListener('window:load', ['$event'])
  adjustResponsiveBody(_event: Event): void {
    const ctaDiv: HTMLElement | null = document.getElementById('cta-div') as HTMLDivElement;
    const animationDiv: HTMLElement | null = document.getElementById('content-div') as HTMLDivElement;
    if (ctaDiv && animationDiv) {
      // adjust margin-top to be responsive to the height of the CTA (footer) div
      animationDiv.style.marginTop = `${ctaDiv.clientHeight / 8}px`;
    }
  }

}
