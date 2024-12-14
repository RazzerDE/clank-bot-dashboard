import { Component } from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {faHeartPulse, faRobot} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'landing-section-tutorial',
  standalone: true,
    imports: [
        FaIconComponent,
        NgOptimizedImage,
        RouterLink
    ],
  templateUrl: './tutorial.component.html',
  styleUrl: './tutorial.component.scss'
})
export class TutorialComponent {

  protected readonly faRobot = faRobot;
  protected readonly faHeartPulse = faHeartPulse;
}
