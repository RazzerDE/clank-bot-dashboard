import {Component, HostListener, Renderer2} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {IconDefinition} from "@fortawesome/free-regular-svg-icons";
import { faCode } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import {nav_items} from "./types/LNavigationItem";
import {LanguageSwitcherService} from "../../../services/language/language-switcher.service";
import {TranslatePipe} from "@ngx-translate/core";
import {LangSwitchButtonComponent} from "../../../structure/util/lang-switch-button/lang-switch-button.component";

@Component({
  selector: 'landing-header',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    FontAwesomeModule,
    TranslatePipe,
    LangSwitchButtonComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  protected mobileMenuExpanded: boolean = false;

  protected faDiscord: IconDefinition = faDiscord;
  protected faCode: IconDefinition = faCode;
  protected readonly nav_items = nav_items;

  constructor(private renderer: Renderer2, protected translateService: LanguageSwitcherService) {}

  /**
   * Toggles the mobile menu's expanded state.
   * If the `close` parameter is true, the menu will be collapsed.
   * Otherwise, the menu's state will be toggled.
   *
   * @param close - Optional boolean to force close the menu.
   */
  toggleMobileMenu(close?: boolean): void {
    this.mobileMenuExpanded = !this.mobileMenuExpanded;
    if (this.mobileMenuExpanded && !close) {
      this.renderer.addClass(document.body, 'nav-expanded');
    } else {
      this.renderer.removeClass(document.body, 'nav-expanded');
    }
  }

  /**
   * Handles the keydown event on the document.
   * If the Escape key is pressed, the mobile menu will be collapsed.
   *
   * @param event - The keyboard event object.
   */
  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.toggleMobileMenu(true);
    }
  }

  /**
   * Handles the click event on the document.
   * If a click occurs outside the mobile menu, the mobile menu will be collapsed.
   *
   * @param event - The mouse event object.
   */
  @HostListener('document:click', ['$event'])
  onClickOutsideHandler(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (['header-buttons', 'bar', 'dot1', 'dot2', 'dot3']
      .some(cls => target.id === cls || target.classList.contains(cls))) return;

    this.toggleMobileMenu(true);
  }

  /**
   * Handles the window resize event.
   * If the window width exceeds 768 pixels, the mobile menu is collapsed
   * and the 'nav-expanded' class is removed from the body.
   *
   * @param _event - The resize event object (not used).
   */
  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResize(_event: Event): void {
    if (window.innerWidth > 991) { // Adjust the threshold as needed
      this.mobileMenuExpanded = false;
      this.renderer.removeClass(document.body, 'nav-expanded');
    }
  }
}
