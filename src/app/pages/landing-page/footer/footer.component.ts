import {Component, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
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

}
