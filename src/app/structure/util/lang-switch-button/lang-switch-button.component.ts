import {Component} from '@angular/core';
import {LanguageSwitcherService} from "../../../services/language/language-switcher.service";
import {NgClass, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'lang-switch-button',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgClass
  ],
  templateUrl: './lang-switch-button.component.html',
  styleUrl: './lang-switch-button.component.scss'
})
export class LangSwitchButtonComponent {
  protected isLangSwitched: boolean = false;

  constructor(protected translateService: LanguageSwitcherService) {}

  /**
   * Switches the language of the application.
   * Toggles the `isLangSwitched` state and sets the new language using the `LanguageSwitcherService`.
   *
   * @param lang - The language code to switch to (e.g., 'en' for English, 'de' for German).
   */
  switchLanguage(lang: string): void {
    this.isLangSwitched = !this.isLangSwitched;
    this.translateService.setLanguage(lang);
  }

}
