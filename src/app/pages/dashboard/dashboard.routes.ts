import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  // Dashboard default pages
  { path: '', loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent)},
  { path: 'contact', loadComponent: () => import('./general/contact/contact.component').then(m => m.ContactComponent)},
  { path: 'wishlist', loadComponent: () => import('./general/wishlist/wishlist.component').then(m => m.WishlistComponent)},
  { path: 'teamlist', loadComponent: () => import('./general/teamlist/teamlist.component').then(m => m.TeamlistComponent)},

  // Support pages
  { path: 'support/setup', loadComponent: () => import('./support/module-setup/module-setup.component').then(m => m.ModuleSetupComponent)},
  { path: 'support/themes', loadComponent: () => import('./support/support-themes/support-themes.component').then(m => m.SupportThemesComponent)},
  { path: 'support/snippets', loadComponent: () => import('./support/ticket-snippets/ticket-snippets.component').then(m => m.TicketSnippetsComponent)},
  { path: 'support/blocked-users', loadComponent: () => import('./support/blocked-users/blocked-users.component').then(m => m.BlockedUsersComponent)},

  // Events pages
  { path: 'events/view', loadComponent: () => import('./events/active-giveaways/active-giveaways.component').then(m => m.ActiveGiveawaysComponent)},
  { path: 'events/design', loadComponent: () => import('./events/embed-design/embed-design.component').then(m => m.EmbedDesignComponent)},
  { path: 'events/channel-roles', loadComponent: () => import('./events/event-effects/event-effects.component').then(m => m.EventEffectsComponent)},

  // Security pages
  { path: 'security/moderation-requests', loadComponent: () => import('./security/moderation-requests/moderation-requests.component').then(m => m.ModerationRequestsComponent)},
  { path: 'security/shield', loadComponent: () => import('./security/active-shields/active-shields.component').then(m => m.ActiveShieldsComponent)},
  { path: 'security/logs', loadComponent: () => import('./security/logs/logs.component').then(m => m.LogsComponent)},
  { path: 'security/automod', loadComponent: () => import('./security/automod-unban/automod-unban.component').then(m => m.AutomodUnbanComponent)},

  // Miscellaneous pages
  { path: 'misc/global-chat', loadComponent: () => import('./misc/global-chat/global-chat.component').then(m => m.GlobalChatComponent)},
];
