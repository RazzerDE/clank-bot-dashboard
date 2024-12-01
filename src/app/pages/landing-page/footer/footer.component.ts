import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {IconDefinition} from "@fortawesome/free-regular-svg-icons";
import {faChevronUp} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {nav_items} from "../header/types/LNavigationItem";
import {RouterLink} from "@angular/router";

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

  ngAfterViewInit() {
    // Check if the invite button is in view; if so, animate it
    const observer: IntersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.invite_btn.nativeElement.classList.toggle('animate__animated', entry.isIntersecting);
        this.invite_btn.nativeElement.classList.toggle('animate__fadeInUp', entry.isIntersecting);
      });
    });

    observer.observe(this.invite_btn.nativeElement);
  }
}
