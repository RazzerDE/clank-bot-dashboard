import {AfterViewInit, Component} from '@angular/core';
import {DataHolderService} from "../../../services/data/data-holder.service";
import {RouterLink} from "@angular/router";
import {NgOptimizedImage} from "@angular/common";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faHome} from "@fortawesome/free-solid-svg-icons";
import {faDiscord} from "@fortawesome/free-brands-svg-icons";

@Component({
  selector: 'app-simple-error',
  standalone: true,
  imports: [
    RouterLink,
    NgOptimizedImage,
    TranslatePipe,
    FaIconComponent
  ],
  templateUrl: './simple-error.component.html',
  styleUrl: './simple-error.component.scss'
})
export class SimpleErrorComponent implements AfterViewInit {

  constructor(protected dataService: DataHolderService, private translate: TranslateService) {}

  ngAfterViewInit(): void {
    this.dataService.isLoading = false;

    this.translate.onLangChange.subscribe((): void => {
      document.title = this.translate.instant('ERROR_PAGE_TITLE');
    });
  }

  protected readonly faHome = faHome;
  protected readonly faDiscord = faDiscord;
}
