import {Component, inject, Inject, PLATFORM_ID} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {PageLoaderComponent} from "./structure/util/page-loader/page-loader.component";
import {LanguageSwitcherService} from "./services/language/language-switcher.service";
import {DataHolderService} from "./services/data/data-holder.service";
import {isPlatformBrowser, Location} from "@angular/common";
import {Meta, Title} from "@angular/platform-browser";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, PageLoaderComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(private langService: LanguageSwitcherService, private dataService: DataHolderService,
              @Inject(PLATFORM_ID) private platformId: Object, private title: Title, private meta: Meta) {
    this.langService.setLanguage();

    if (isPlatformBrowser(this.platformId)) { // only run in browser
      this.dataService.isDarkTheme = this.dataService.getThemeFromLocalStorage();
      this.dataService.applyTheme();
    } else {
      const location: Location = inject(Location);
      if (!location.path().endsWith('de')) {
        this.updateSEO();  // update meta tags for english version
      }
    }
  }

  /**
   * Updates the SEO-related meta tags and page title for the English version of the site.
   *
   * Sets the title, description, Open Graph, and Twitter meta tags to improve search engine visibility and social sharing.
   */
  private updateSEO(): void {
    const desc: string = "Clank is the heart of your Discord server: In addition to its ease of use and beautiful " +
      "menus, it offers you everything you need to protect and grow your own community."
    this.title.setTitle('This is Clank ~ Clank Discord-Bot');
    this.meta.updateTag({name: 'twitter:title', content: 'This is Clank ~ Clank Discord-Bot'});

    this.meta.updateTag({name: 'description', content: desc});
    this.meta.updateTag({property: 'og:description', content: desc});
    this.meta.updateTag({name: 'twitter:description', content: desc});
    this.meta.updateTag({property: 'og:locale', content: 'en_US'});
  }
}
