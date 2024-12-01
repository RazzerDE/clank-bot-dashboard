import { Component } from '@angular/core';
import {HeaderComponent} from "./pages/landing-page/header/header.component";
import {FooterComponent} from "./pages/landing-page/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
