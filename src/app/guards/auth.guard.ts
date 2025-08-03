import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from "@angular/router";
import {catchError, map, Observable, of, tap} from "rxjs";
import {inject} from "@angular/core";
import {AuthService} from "../services/auth/auth.service";
import {DiscordUser} from "../services/types/discord/User";
import {config} from "../../environments/config";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import {DataHolderService} from "../services/data/data-holder.service";

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> => {
  const authService: AuthService = inject(AuthService);
  const dataService: DataHolderService = inject(DataHolderService);
  const http: HttpClient = inject(HttpClient);
  const router: Router = inject(Router);
  dataService.isLoginLoading = true;

  // Handle Discord callback with code and state
  if (route.queryParams['code'] && route.queryParams['state']) {
    authService.authenticateUser(route.queryParams['code'], route.queryParams['state'], true);
    return of(true);
  }

  // if no active_guild is set but a logged in page is requested, redirect to the dashboard
  if (!dataService.active_guild && (!(route.routeConfig?.path?.endsWith('dashboard') || route.routeConfig?.path?.endsWith('dashboard/contact')))) {
    router.navigateByUrl('/dashboard').then();
    dataService.isLoginLoading = false;
    return of(false);
  }

  // Verify existing token
  return http.get<DiscordUser>(`${config.api_url}/auth/me`, { withCredentials: true }).pipe(
    tap((response: DiscordUser): void => { dataService.profile = response; dataService.isLoginLoading = false;}), map((): boolean => true),
    catchError((error: HttpErrorResponse): Observable<boolean> => {
      if (error.status === 401) { // not authenticated
        authService.discordLogin();
      } else {
        dataService.redirectLoginError('UNKNOWN');
        authService.logout();
      }
      return of(false);
    })
  );
};
