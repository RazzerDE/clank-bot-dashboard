import { Routes } from '@angular/router';
import {LandingPageComponent} from "./pages/landing-page/landing-page.component";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";
import {SimpleErrorComponent} from "./pages/dashboard/errors/simple-error.component";

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'dashboard', component: DashboardComponent },

  // Error pages
  { path: 'errors/simple', component: SimpleErrorComponent}
];
