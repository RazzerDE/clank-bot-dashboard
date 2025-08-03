import { Routes } from '@angular/router';
import {LandingPageComponent} from "./pages/landing-page/landing-page.component";
import {SimpleErrorComponent} from "./pages/dashboard/errors/simple-error.component";

export const routes: Routes = [
  // General pages
  { path: '', component: LandingPageComponent },
  { path: 'de', component: LandingPageComponent },

  // Dashboard pages (lazy loaded)
  { path: 'dashboard',
    loadChildren: () => import('../app/pages/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
  },

  // Error pages
  { path: 'errors/simple', component: SimpleErrorComponent },
  { path: '**', component: SimpleErrorComponent }
];
