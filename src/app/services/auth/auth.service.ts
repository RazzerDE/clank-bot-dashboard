import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {config} from "../../../environments/config";
import {AccessCode} from "../types/Authenticate";
import {DiscordUser} from "../types/discord/User";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl: string = `https://discord.com/oauth2/authorize?client_id=${config.client_id}&response_type=code&redirect_uri=${config.redirect_url}&scope=identify+guilds+guilds.members.read`
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  });

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  /**
   * Authenticates the user with the provided Discord authorization code and state.
   * Sends a POST request to the backend API with the authorization code and state.
   * On successful authentication, stores the access token in local storage,
   * updates the authorization header, and navigates the user to the dashboard.
   * If the state does not match the stored state, navigates to the invalid login error page.
   * If an error occurs during authentication, navigates to the appropriate error page.
   *
   * @param {string} code - The Discord authorization code.
   * @param {string} state - The state parameter to prevent CSRF attacks.
   */
  authenticateUser(code: string, state: string): void {
    // check if the state is the same as the one stored in local storage
    if (state !== localStorage.getItem('state')) {
      this.router.navigateByUrl(`/errors/invalid-login`).then();
      return;
    }

    this.http.post<any>(`${config.api_url}/auth/discord`, { code: code, state: state })
      .subscribe({
        next: (response: AccessCode): void => {
          localStorage.removeItem('state');  // clean up stored state
          localStorage.setItem('access_token', response.access_token);
          this.headers = this.headers.set('Authorization', `Bearer ${response.access_token}`);
        },
        error: (error: HttpErrorResponse): void => {
          if (error.status === 400) {  // access_token is not valid
            this.router.navigateByUrl(`/errors/invalid-login`).then();
          } else {
            this.router.navigateByUrl(`/errors/unknown`).then();
          }
        }
      });
  }

  /**
   * Verifies the login by checking the query parameters for a valid login code.
   * If the code is not present, redirects the user to the Discord authentication URL.
   * If the code is present, authenticates the user using the provided code.
   */
  discordLogin(): void {
    this.route.queryParams.subscribe(params => {
      if ((!params['code'] || !params['state']) && !window.location.pathname.includes("errors/")) {
        // already authenticated
        if (localStorage.getItem('access_token')) {
          this.isValidToken();
          return;
        }

        // redirect to discord if invalid login code
        this.appendState();
        window.location.href = this.authUrl;
        return;
      }

      this.authenticateUser(params['code'], params['state']);
    });
  }

  /**
   * Checks if the stored access token is valid.
   * If the token is not present, redirects the user to the invalid login error page.
   * If the token is present, sends a request to verify the token.
   * If the token is invalid or an error occurs, redirects the user to the appropriate error page.
   */
  isValidToken(): void {
    if (!localStorage.getItem('access_token')) {
      this.router.navigateByUrl(`/errors/invalid-login`).then();
      return;
    }

    this.http.get<any>(`${config.discord_url}/users/@me`, { headers: this.headers }).subscribe({
      next: (_response: DiscordUser): void => {},
      error: (error: HttpErrorResponse): void => {
        localStorage.removeItem('access_token');
        const errorPath: string = error.status === 401 ? '/errors/invalid-login' : '/errors/unknown';
        this.router.navigateByUrl(errorPath).then();
      }
    });
  }

  /**
   * Appends a unique state parameter to the authentication URL.
   * The state parameter is used to prevent CSRF attacks during the OAuth2 flow.
   * If a state parameter is already present in local storage, it uses that value.
   * Otherwise, it generates a new random state value and stores it in local storage.
   * The state parameter is then appended to the `authUrl`.
   */
  appendState(): void {
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('state', state);
    this.http.post<any>(`${config.api_url}/auth/saveState`, { state: state }).subscribe();

    const stateRegex = /(&state=[^&]*)/;
    if (this.authUrl.match(stateRegex)) {
      if (!this.authUrl.includes(`state=${state}`)) {
        this.authUrl = this.authUrl.replace(stateRegex, `&state=${state}`);
      }
    } else {
      this.authUrl += `&state=${state}`;
    }
  }
}
