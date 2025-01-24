import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {config} from "../../../environments/config";
import {AccessCode} from "../types/Authenticate";
import {DiscordUser} from "../types/discord/User";
import {JwtHelperService} from "@auth0/angular-jwt";
import {DataHolderService} from "../data/data-holder.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl: string = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(config.client_id)}&response_type=code&redirect_uri=${encodeURIComponent(config.redirect_url)}&scope=identify+guilds+guilds.members.read`
  headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
  private jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router,
              private dataService: DataHolderService) {
    if (localStorage.getItem('access_token')) {
      this.headers = this.setAuthorizationHeader(localStorage.getItem('access_token')!);
    }
  }

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
   * @param {boolean} fetch_profile - Whether to fetch the user profile after authentication.
   */
  authenticateUser(code: string, state: string, fetch_profile?: boolean): void {
    // state expiration check
    const stateExpiry: string | null = localStorage.getItem('state_expiry');
    if (!stateExpiry || Date.now() > parseInt(stateExpiry)) {
      this.dataService.redirectLoginError('EXPIRED');
      return;
    }

    // check if the state is the same as the one stored in local storage
    if (state !== atob(localStorage.getItem('state')!)) {
      this.dataService.redirectLoginError('INVALID');
      return;
    }

    this.http.post<any>(`${config.api_url}/auth/discord`, { code: code, state: state })
      .subscribe({
        next: (response: AccessCode): void => {
          localStorage.removeItem('state');  // clean up stored state
          localStorage.removeItem('state_expiry');

          // decrypt token and store it
          response.access_token = this.decryptToken(response.access_token);
          if (!response.access_token) { return; }

          localStorage.setItem('access_token', response.access_token);
          this.headers = this.setAuthorizationHeader(response.access_token);
          window.dispatchEvent(new StorageEvent('storage'));  // trigger event listener

          // remove query parameters from URL
          this.router.navigateByUrl('/dashboard').then((): void => {
              if (fetch_profile) { // fetch profile directly after discord callback
                this.isValidToken(response.access_token);
              }
            }
          );
        },
        error: (error: HttpErrorResponse): void => {
          if (error.status === 400) {  // code is not valid
            this.dataService.redirectLoginError('INVALID');
          } else if (error.status === 429) {  // ratelimited
            this.dataService.redirectLoginError('BLOCKED');
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }
        }
      });
  }

  /**
   * Checks if the stored access token is valid.
   * If the token is not present, redirects the user to the invalid login error page.
   * If the token is present, sends a request to verify the token.
   * If the token is invalid or an error occurs, redirects the user to the appropriate error page.
   *
   * @param {string} access_token - The access token to verify. If not provided, uses the stored access token.
   */
  private isValidToken(access_token?: string): void {
    let temp_headers: HttpHeaders = this.headers;
    if (access_token) {
      temp_headers = this.headers.set('Authorization', `Bearer ${access_token}`);
    }

    this.http.get<DiscordUser>(`${config.discord_url}/users/@me`, { headers: temp_headers }).subscribe({
      next: (response: DiscordUser): void => {
        this.dataService.profile = response;
      },
      error: (error: HttpErrorResponse): void => {
        localStorage.removeItem('access_token');

        if (error.status === 401) {
          this.dataService.redirectLoginError('EXPIRED');
        } else {
          this.dataService.redirectLoginError('UNKNOWN');
        }
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
  private appendState(): void {
    const encodedState: string = btoa(this.generateSecureState());
    localStorage.setItem('state', encodedState);
    localStorage.setItem('state_expiry', (Date.now() + 5 * 60 * 1000).toString()); // Add 5min expiry

    this.http.post<void>(`${config.api_url}/auth/saveState`, { state: atob(encodedState) })
      .subscribe({
        next: (): void => {
          // replace state if it already exists in the URL
          const stateRegex = /(&state=[^&]*)/;
          if (this.authUrl.match(stateRegex)) {
            if (!this.authUrl.includes(`state=${atob(encodedState)}`)) {
              this.authUrl = this.authUrl.replace(stateRegex, `&state=${encodeURIComponent(atob(encodedState))}`);
            }
          } else {
            this.authUrl += `&state=${atob(encodedState)}`;
          }
          window.location.href = this.authUrl;
        },
        error: (): void => {
          // Handle state save error
          localStorage.removeItem('state');
          localStorage.removeItem('state_expiry');
          this.dataService.redirectLoginError('UNKNOWN');
        }
      });
  }

  /**
   * Generates a secure random state string for OAuth2 flow.
   * The state parameter is used to prevent CSRF attacks.
   * This function uses the Web Crypto API to generate a cryptographically secure random value.
   *
   * @returns {string} A secure random state string.
   */
  private generateSecureState(): string {
    const array = new Uint8Array(32);
    return Array.from(crypto.getRandomValues(array), byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Sets the Authorization header with the provided token.
   *
   * @param {string} token - The access token to be set in the Authorization header.
   * @returns {HttpHeaders} The updated HttpHeaders object with the Authorization header set.
   */
  setAuthorizationHeader(token: string): HttpHeaders {
    return this.headers.set('Authorization', `Bearer ${token}`);
  }

  /**
   * Decrypts the given encrypted token.
   *
   * This method takes an encrypted token as input, decodes it using the JWT library,
   * and returns the original Discord token. If the decryption fails, it logs an error
   * and navigates the user to the invalid login error page.
   *
   * @param {string} encryptedToken - The encrypted token to be decrypted.
   * @returns {string} The original Discord token.
   */
  private decryptToken(encryptedToken: string): string {
    // The JWT library will automatically validate the signature using the same key
    try {
      const decodedToken = this.jwtHelper.decodeToken(encryptedToken);
      return decodedToken.sub; // The original Discord token
    } catch (error) {
      this.dataService.redirectLoginError('INVALID');
      return '';
    }
  }

  /**
   * Checks if the user has administrator permissions.
   *
   * This method takes a permission string, converts it to a BigInt, and checks if the
   * administrator permission bit is set. The administrator permission is represented
   * by the bit value `0x00000008`.
   *
   * @param {string} perm_string - The permission string to check.
   * @returns {boolean} `true` if the user has administrator permissions, `false` otherwise.
   */
  isAdmin(perm_string: string): boolean {
    const ADMINISTRATOR_PERMISSION = 0x00000008;
    return (BigInt(perm_string) & BigInt(ADMINISTRATOR_PERMISSION)) !== 0n;
  }

  /**
   * Logs out the user by removing the access token from local storage
   * and navigating to the home page.
   */
  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigateByUrl('/').then();
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
        return;
      }

      if (params['code'] && params['state']) {
        this.authenticateUser(params['code'], params['state']);
      }
    });
  }
}
