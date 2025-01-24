import {Component} from '@angular/core';
import {HeaderComponent} from "./header/header.component";
import {FooterComponent} from "./footer/footer.component";
import {LandingSectionFeaturesComponent} from "./sections/features/features.component";
import {TutorialComponent} from "./sections/tutorial/tutorial.component";
import {IntroComponent} from "./sections/intro/intro.component";

@Component({
    selector: 'landing-page',
    imports: [
        HeaderComponent,
        FooterComponent,
        LandingSectionFeaturesComponent,
        TutorialComponent,
        IntroComponent
    ],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {}
