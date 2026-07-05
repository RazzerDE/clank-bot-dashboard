import { Component, inject } from '@angular/core';
import {NgClass} from "@angular/common";
import {DataHolderService} from "../../../services/data/data-holder.service";

@Component({
    selector: 'app-page-loader',
    imports: [
        NgClass
    ],
    templateUrl: './page-loader.component.html',
    styleUrl: './page-loader.component.scss'
})
export class PageLoaderComponent {  protected dataService = inject(DataHolderService);


}
