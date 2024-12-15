import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {PageLoaderComponent} from "./structure/util/page-loader/page-loader.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PageLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
