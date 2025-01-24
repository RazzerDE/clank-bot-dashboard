import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from "@angular/router";
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
  const accessToken: string | null = localStorage.getItem('access_token');

  // Handle Discord callback with code and state
  if (route.queryParams['code'] && route.queryParams['state']) {
    authService.authenticateUser(route.queryParams['code'], route.queryParams['state'], true);
    return of(true);
  }

  // If no access token, redirect to Discord login
  if (!accessToken) {
    localStorage.clear();
    authService.discordLogin();
    return of(false);
  }

  // Verify existing token
  return http.get<DiscordUser>(`${config.discord_url}/users/@me`, { headers: authService.headers}).pipe(
    tap((response: DiscordUser): void => { dataService.profile = response; }), map((): boolean => true),
    catchError((error: HttpErrorResponse): Observable<boolean> => {
      localStorage.removeItem('access_token');
      if (error.status === 401) {
        dataService.redirectLoginError('EXPIRED');
      } else {
        dataService.redirectLoginError('UNKNOWN');
      }
      return of(false);
    })
  );
};
