import {AfterViewInit, Component} from '@angular/core';
import {DataHolderService} from "../../../services/data/data-holder.service";
import {RouterLink} from "@angular/router";
import {NgOptimizedImage} from "@angular/common";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faHome, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faDiscord} from "@fortawesome/free-brands-svg-icons";
import {LangSwitchButtonComponent} from "../../../structure/util/lang-switch-button/lang-switch-button.component";
import {ThemeSwitchButtonComponent} from "../../../structure/util/theme-switch-button/theme-switch-button.component";

@Component({
    selector: 'app-simple-error',
    imports: [
        RouterLink,
        NgOptimizedImage,
        TranslatePipe,
        FaIconComponent,
        LangSwitchButtonComponent,
        ThemeSwitchButtonComponent
    ],
    templateUrl: './simple-error.component.html',
    styleUrl: './simple-error.component.scss'
})
export class SimpleErrorComponent implements AfterViewInit {

  protected readonly faHome: IconDefinition = faHome;
  protected readonly faDiscord: IconDefinition = faDiscord;
  protected readonly localStorage = localStorage;

  constructor(protected dataService: DataHolderService, private translate: TranslateService) {
    this.dataService.isLoading = true;
  }

  /**
   * Lifecycle hook that is called after a component's view has been fully initialized.
   * Subscribes to language change events and updates the document title accordingly.
   * Also sets the `isLoading` flag to false once the language change event is processed.
   */
  ngAfterViewInit(): void {
    this.translate.onLangChange.subscribe((): void => {
      document.title = this.translate.instant('ERROR_PAGE_TITLE');
    });

    this.dataService.isLoading = false;
  }
}
