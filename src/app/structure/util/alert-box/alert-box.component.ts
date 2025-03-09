import { Component } from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faBug} from "@fortawesome/free-solid-svg-icons/faBug";
import {NgClass} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";
import {DataHolderService} from "../../../services/data/data-holder.service";

@Component({
  selector: 'app-alert-box',
  imports: [
    FaIconComponent,
    NgClass
  ],
  templateUrl: './alert-box.component.html',
  styleUrl: './alert-box.component.scss',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AlertBoxComponent {
  protected readonly faXmark: IconDefinition = faXmark;
  protected readonly faBug: IconDefinition = faBug;

  constructor(protected dataService: DataHolderService) {
  }
}
