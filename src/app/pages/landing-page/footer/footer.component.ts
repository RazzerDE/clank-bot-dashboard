import {Component, AfterViewInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import { faChevronUp, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { nav_items } from '../header/types/LNavigationItem';
import {NgOptimizedImage} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {RouterLink} from "@angular/router";
import {AnimationService} from "../../../services/animation/animation.service";

@Component({
  selector: 'landing-footer',
  standalone: true,
  imports: [
    NgOptimizedImage,
    FaIconComponent,
    RouterLink
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements AfterViewInit {
  @ViewChild('invite_btn')
  protected invite_btn!: ElementRef;
  protected faChevronUp: IconDefinition = faChevronUp;
  protected readonly nav_items = nav_items;

  constructor(private animations: AnimationService) {}

  ngAfterViewInit() {
    const observer: IntersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // fix flickering issue on page load
        if (entry.intersectionRatio < 0.9) {
          this.invite_btn.nativeElement.classList.add('animate__animated', 'animate__fadeInUp');
          observer.unobserve(entry.target);
          return;
        }

        // animate the invite button when it is in view
        this.invite_btn.nativeElement.classList.toggle('animate__animated', entry.isIntersecting);
        this.invite_btn.nativeElement.classList.toggle('animate__fadeInUp', entry.isIntersecting);
      });
    });

    observer.observe(this.invite_btn.nativeElement);

    // start firefly animation for footer
    this.animations.setCanvasID('footer-canvas');
    this.animations.initCanvas();
    this.animations.startAnimation();
  }

  /**
   * Adjusts the margin-top of the footer content to be responsive to the height of the Call to Action (CTA) div.
   * This method is triggered on various fullscreen change events and window resize events.
   *
   * @param _event - The event object (not used in the function).
   */
  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  @HostListener('window:resize', ['$event'])
  adjustFooterMargin(_event: Event): void {
    const ctaDiv = document.getElementById('cta-div');
    const contentDiv = document.getElementById('content-div');
    if (!ctaDiv || !contentDiv) return;

    // adjust margin-top to be responsive to the height of the CTA div
    const ctaHeight = ctaDiv.offsetHeight;
    contentDiv.style.marginTop = `${ctaHeight - 175}px`;
  }

}
