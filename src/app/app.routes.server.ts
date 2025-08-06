import {RenderMode, ServerRoute} from "@angular/ssr";


export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },   // SSR only for landing page
  { path: 'de', renderMode: RenderMode.Prerender }, // SSR for German landing page
  { path: '**', renderMode: RenderMode.Client },    // CSR for all other pages
];
