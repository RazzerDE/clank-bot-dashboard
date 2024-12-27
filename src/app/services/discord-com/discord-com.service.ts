import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {config} from "../../../environments/config";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {Guild} from "./types/Guilds";

@Injectable({
  providedIn: 'root'
})
export class DiscordComService {
  private readonly headers: HttpHeaders;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.headers = this.authService.getHeaders();
  }

  getGuilds(): Observable<Guild[]> {
    return this.http.get<Guild[]>(`${config.discord_url}/users/@me/guilds?with_counts=True`, {headers: this.headers});
  }
}
