import { Component } from '@angular/core';
import {HeaderComponent} from "./header/header.component";
import {FooterComponent} from "./footer/footer.component";
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {nav_items} from "./header/types/LNavigationItem";
import {LandingSectionFeaturesComponent} from "./sections/features/features.component";

@Component({
  selector: 'landing-page',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    NgOptimizedImage,
    RouterLink,
    LandingSectionFeaturesComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

    protected readonly nav_items = nav_items;

}
