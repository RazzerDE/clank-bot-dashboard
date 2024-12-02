import { Component } from '@angular/core';
import {LandingPageComponent} from "./pages/landing-page/landing-page.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LandingPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
