import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {PageLoaderComponent} from "./structure/util/page-loader/page-loader.component";
import {LanguageSwitcherService} from "./services/language/language-switcher.service";
import {DataHolderService} from "./services/data/data-holder.service";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, PageLoaderComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(private langService: LanguageSwitcherService, private dataService: DataHolderService) {
    this.langService.setLanguage();

    this.dataService.isDarkTheme = this.dataService.getThemeFromLocalStorage();
    this.dataService.applyTheme();
  }
}
