import {AfterViewInit, Component} from '@angular/core';
import {DataHolderService} from "../../../services/data/data-holder.service";
import {Router, RouterLink} from "@angular/router";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faHome, faLink, IconDefinition} from "@fortawesome/free-solid-svg-icons";
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
    ThemeSwitchButtonComponent,
    NgClass
  ],
    templateUrl: './simple-error.component.html',
    styleUrl: './simple-error.component.scss'
})
export class SimpleErrorComponent implements AfterViewInit {

  protected readonly faHome: IconDefinition = faHome;
  protected readonly faDiscord: IconDefinition = faDiscord;
  protected readonly faLink: IconDefinition = faLink;
  protected readonly localStorage: Storage = localStorage;

  protected invite_url: string = 'https://discord.com/oauth2/authorize?client_id=775415193760169995 ' +
    '&permissions=10430293995255&integration_type=0&scope=bot+applications.commands' +
    `&guild_id=${this.dataService.active_guild?.id}&disable_guild_select=true`

  constructor(protected dataService: DataHolderService, private translate: TranslateService, protected router: Router) {
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
      this.invite_url = 'https://discord.com/oauth2/authorize?client_id=775415193760169995 ' +
        '&permissions=10430293995255&integration_type=0&scope=bot+applications.commands' +
        `&guild_id=${this.dataService.active_guild?.id}&disable_guild_select=true`
    });

    if (this.router.url != '/errors/simple') {  // custom 404 error page
      this.dataService.error_title = this.translate.instant('ERROR_PAGE_404_TITLE');
      this.dataService.error_desc = this.translate.instant('ERROR_PAGE_404_DESC');
    }

    this.dataService.isLoading = false;
  }
}
