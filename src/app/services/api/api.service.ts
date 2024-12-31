import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {GeneralStats} from "../types/Statistics";
import {SliderItems} from "../types/landing-page/SliderItems";
import {config} from "../../../environments/config";
import {TasksCompletionList} from "../../pages/dashboard/types/Tasks";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly API_URL: string = config.api_url;

  constructor(private http: HttpClient) { }

  /**
   * Fetches general statistics about the clank bot (guild count, user count & module related statistics).
   *
   * @returns An Observable that emits the general statistics.
   */
  getGeneralStats(): Observable<GeneralStats> {
    return this.http.get<GeneralStats>(`${this.API_URL}/stats/general`);
  }

  /**
   * Fetches some famous guilds that are using the clank bot.
   *
   * @returns An Observable that emits an array of SliderItems, each containing information about a guild.
   */
  getGuildUsage(limit: number): Observable<SliderItems[]> {
    return this.http.get<SliderItems[]>(`${this.API_URL}/stats/guilds_usage` + (limit ? `?limit=${limit}` : ''));
  }

  /**
   * Fetches the status of all bot modules for a specific guild.
   *
   * @param guild_id - The ID of the guild for which to fetch the module status.
   * @returns An Observable that emits the status of the modules.
   */
  getModuleStatus(guild_id: string): Observable<TasksCompletionList> {
    console.log('guild_id', guild_id);
    return this.http.get<TasksCompletionList>(`${this.API_URL}/progress/modules?guild_id=${guild_id}`);
  }
}
