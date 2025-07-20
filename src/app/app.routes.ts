import { Routes } from '@angular/router';
import {LandingPageComponent} from "./pages/landing-page/landing-page.component";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";
import {SimpleErrorComponent} from "./pages/dashboard/errors/simple-error.component";
import {AuthGuard} from "./guards/auth.guard";
import {ContactComponent} from "./pages/dashboard/general/contact/contact.component";
import {WishlistComponent} from "./pages/dashboard/general/wishlist/wishlist.component";
import {TeamlistComponent} from "./pages/dashboard/general/teamlist/teamlist.component";
import {ModuleSetupComponent} from "./pages/dashboard/support/module-setup/module-setup.component";
import {SupportThemesComponent} from "./pages/dashboard/support/support-themes/support-themes.component";
import {TicketSnippetsComponent} from "./pages/dashboard/support/ticket-snippets/ticket-snippets.component";
import {BlockedUsersComponent} from "./pages/dashboard/support/blocked-users/blocked-users.component";
import {ActiveGiveawaysComponent} from "./pages/dashboard/events/active-giveaways/active-giveaways.component";
import {EmbedDesignComponent} from "./pages/dashboard/events/embed-design/embed-design.component";
import {EventEffectsComponent} from "./pages/dashboard/events/event-effects/event-effects.component";
import {
  ModerationRequestsComponent
} from "./pages/dashboard/security/moderation-requests/moderation-requests.component";
import {ActiveShieldsComponent} from "./pages/dashboard/security/active-shields/active-shields.component";
import {LogsComponent} from "./pages/dashboard/security/logs/logs.component";
import {AutomodUnbanComponent} from "./pages/dashboard/security/automod-unban/automod-unban.component";

export const routes: Routes = [
  // General pages
  { path: '', component: LandingPageComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/contact', component: ContactComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/wishlist', component: WishlistComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/teamlist', component: TeamlistComponent, canActivate: [AuthGuard] },

  // Support pages
  { path: 'dashboard/support/setup', component: ModuleSetupComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/support/themes', component: SupportThemesComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/support/snippets', component: TicketSnippetsComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/support/blocked-users', component: BlockedUsersComponent, canActivate: [AuthGuard] },

  // Events pages
  { path: 'dashboard/events/view', component: ActiveGiveawaysComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/events/design', component: EmbedDesignComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/events/channel-roles', component: EventEffectsComponent, canActivate: [AuthGuard] },

  // Security pages
  { path: 'dashboard/security/moderation-requests', component: ModerationRequestsComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/security/shield', component: ActiveShieldsComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/security/logs', component: LogsComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/security/automod', component: AutomodUnbanComponent, canActivate: [AuthGuard] },

  // Error pages
  { path: 'errors/simple', component: SimpleErrorComponent}
];
