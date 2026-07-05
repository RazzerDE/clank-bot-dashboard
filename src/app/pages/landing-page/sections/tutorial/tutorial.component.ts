import { Component, inject } from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgOptimizedImage} from "@angular/common";
import {faHeartPulse, faRobot, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";

@Component({
    selector: 'app-landing-section-tutorial',
    imports: [
        FaIconComponent,
        NgOptimizedImage,
        TranslatePipe
    ],
    templateUrl: './tutorial.component.html',
    styleUrl: './tutorial.component.scss'
})
export class TutorialComponent {
  protected dataService = inject(DataHolderService);


  protected readonly faRobot: IconDefinition = faRobot;
  protected readonly faHeartPulse: IconDefinition = faHeartPulse;
}
