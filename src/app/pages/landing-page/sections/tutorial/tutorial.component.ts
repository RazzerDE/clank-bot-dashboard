import { Component } from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {faHeartPulse, faRobot, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'landing-section-tutorial',
  standalone: true,
  imports: [
    FaIconComponent,
    NgOptimizedImage,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './tutorial.component.html',
  styleUrl: './tutorial.component.scss'
})
export class TutorialComponent {

  protected readonly faRobot: IconDefinition = faRobot;
  protected readonly faHeartPulse: IconDefinition = faHeartPulse;
}
