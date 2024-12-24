import { Component } from '@angular/core';
import {NgClass} from "@angular/common";
import {DataHolderService} from "../../../services/data/data-holder.service";

@Component({
  selector: 'theme-switch-button',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './theme-switch-button.component.html',
  styleUrl: './theme-switch-button.component.scss'
})
export class ThemeSwitchButtonComponent {

  constructor(protected dataService: DataHolderService) {}

}
