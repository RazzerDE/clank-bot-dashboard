import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {HttpClient, provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {duplicateRequestInterceptor} from "./interceptors/duplicate-request";
import {AnimationService} from "./services/animation/animation.service";

const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, './assets/i18n/', '.json');

export const appConfig: ApplicationConfig = {
  providers: [
    AnimationService,
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withFetch(), withInterceptors([duplicateRequestInterceptor])),
    importProvidersFrom([TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    })]),
    importProvidersFrom([BrowserAnimationsModule]), provideClientHydration(withEventReplay())]
};
