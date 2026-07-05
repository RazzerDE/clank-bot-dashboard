import { Component, inject } from '@angular/core';
import {NgClass} from "@angular/common";
import {DataHolderService} from "../../../services/data/data-holder.service";

@Component({
    selector: 'app-theme-switch-button',
    imports: [
        NgClass
    ],
    templateUrl: './theme-switch-button.component.html',
    styleUrl: './theme-switch-button.component.scss'
})
export class ThemeSwitchButtonComponent {  protected dataService = inject(DataHolderService);


}
