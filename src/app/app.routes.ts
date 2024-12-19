import { Routes } from '@angular/router';
import {LandingPageComponent} from "./pages/landing-page/landing-page.component";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";
import {InvalidLoginComponent} from "./pages/dashboard/errors/invalid-login/invalid-login.component";
import {UnknownComponent} from "./pages/dashboard/errors/unknown/unknown.component";

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'dashboard', component: DashboardComponent },

  // Error pages
  { path: 'errors/invalid-login', component: InvalidLoginComponent },
  { path: 'errors/unknown', component: UnknownComponent}
];
