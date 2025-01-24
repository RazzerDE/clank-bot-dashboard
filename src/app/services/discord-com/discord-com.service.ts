import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {config} from "../../../environments/config";
import { HttpClient } from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {Guild} from "./types/Guilds";

@Injectable({
  providedIn: 'root'
})
export class DiscordComService {
  private isInitialized: boolean = false;
  private readonly initPromise: Promise<void> = Promise.resolve();

  constructor(private http: HttpClient, private authService: AuthService) {
    // ensure that every HTTP request inside this file has the correct authorization header
    // is necessary after the first discord login, redirect to dashboard
    if (!localStorage.getItem('access_token')) {
      this.initPromise = new Promise<void>((resolve) => {
        window.addEventListener('storage', (_event: StorageEvent): void => {
          this.authService.headers = this.authService.setAuthorizationHeader(localStorage.getItem('access_token')!);
          this.isInitialized = true;
          resolve();
        });
      });
    }
  }

  /**
   * Ensures that the service is initialized before making any requests.
   *
   * This method checks if the service is initialized. If not, it waits for the initialization
   * promise to resolve, ensuring that the authorization headers are set correctly.
   *
   * @returns {Promise<void>} A promise that resolves when the service is initialized.
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initPromise;
    }
  }

  async getGuilds(): Promise<Observable<Guild[]>> {
    await this.ensureInitialized();
    return this.http.get<Guild[]>(`${config.discord_url}/users/@me/guilds?with_counts=True`,
      { headers: this.authService.headers });
  }
}
