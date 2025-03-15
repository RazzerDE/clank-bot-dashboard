import { Routes } from '@angular/router';
import {LandingPageComponent} from "./pages/landing-page/landing-page.component";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";
import {SimpleErrorComponent} from "./pages/dashboard/errors/simple-error.component";
import {AuthGuard} from "./guards/auth.guard";
import {ContactComponent} from "./pages/dashboard/general/contact/contact.component";
import {WishlistComponent} from "./pages/dashboard/general/wishlist/wishlist.component";
import {TeamlistComponent} from "./pages/dashboard/general/teamlist/teamlist.component";
import {ModuleSetupComponent} from "./pages/dashboard/support/module-setup/module-setup.component";

export const routes: Routes = [
  // General pages
  { path: '', component: LandingPageComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/contact', component: ContactComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/wishlist', component: WishlistComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/teamlist', component: TeamlistComponent, canActivate: [AuthGuard] },

  // Support pages
  { path: 'dashboard/support/setup', component: ModuleSetupComponent, canActivate: [AuthGuard] },

  // Error pages
  { path: 'errors/simple', component: SimpleErrorComponent}
];
