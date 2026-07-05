import { Component, inject } from '@angular/core';
import {LanguageSwitcherService} from "../../../services/language/language-switcher.service";
import {NgClass, NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-lang-switch-button',
    imports: [
        NgOptimizedImage,
        NgClass
    ],
    templateUrl: './lang-switch-button.component.html',
    styleUrl: './lang-switch-button.component.scss'
})
export class LangSwitchButtonComponent {
  protected translateService = inject(LanguageSwitcherService);

  protected isLangSwitched = false;

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
