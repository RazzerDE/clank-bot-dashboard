import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {Observable, of} from "rxjs";
import {GeneralStats} from "../types/Statistics";
import {SliderItems} from "../types/landing-page/SliderItems";
import {config} from "../../../environments/config";
import {TasksCompletionList} from "../types/Tasks";
import {AuthService} from "../auth/auth.service";
import {formGroupBug, formGroupIdea} from "../types/Forms";
import {FeatureData, FeatureVotes} from "../types/navigation/WishlistTags";
import {SupportSetup} from "../types/discord/Guilds";
import {SupportTheme, TicketAnnouncement, TicketSnippet} from "../types/Tickets";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly API_URL: string = config.api_url;

  constructor(private http: HttpClient, private authService: AuthService) { }

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
   * Fetches the votes of all bot features.
   *
   * @returns An Observable that emits the feature votes.
   */
  getFeatureVotes(): Observable<FeatureVotes> {
    return this.http.get<FeatureVotes>(`${this.API_URL}/progress/features`, { headers: this.authService.headers });
  }

  /**
   * Fetches the status of all bot modules for a specific guild.
   * This function also caches the module status for 1 minute, to avoid ratelimits.
   *
   * @param guild_id - The ID of the guild for which to fetch the module status.
   * @returns An Observable that emits the status of the modules.
   */
  getModuleStatus(guild_id: string): Observable<TasksCompletionList> {
    const moduleStatusTimestamp: string | null = localStorage.getItem('moduleStatusTimestamp');
    const moduleStatus: string | null = localStorage.getItem('moduleStatus');

    try {
      if (moduleStatusTimestamp && moduleStatus) {
        const timestamp: number = parseInt(moduleStatusTimestamp);
        const module: TasksCompletionList = JSON.parse(moduleStatus);

        // check if module status cache is younger than 1 minute
        if (Date.now() - timestamp < 60000 && module['task_1'].guild_id === guild_id) {
          module['task_1'].cached = true;
          return of(module);
        }
      }
    } catch (error) { console.error('Cache reading error:', error); }

    return this.http.get<TasksCompletionList>(`${this.API_URL}/progress/modules?guild_id=${guild_id}`,
      { headers: this.authService.headers });
  }

  /**
   * Fetches the support setup status for a specific guild.
   *
   * @param guild_id - The ID of the guild for which to fetch the support setup status.
   * @returns An Observable that emits the support setup status.
   */
  getSupportSetupStatus(guild_id: string): Observable<SupportSetup> {
    return this.http.get<SupportSetup>(`${this.API_URL}/guilds/support-setup?guild_id=${guild_id}`,
      { headers: this.authService.headers });
  }

  /**
   * Fetches the predefined text snippets for a specific guild.
   *
   * @param guild_id - The ID of the guild for which to fetch the ticket snippets.
   * @returns An Observable that emits the ticket snippets.
   */
  getSnippets(guild_id: string): Observable<TicketSnippet[]> {
    return this.http.get<TicketSnippet[]>(`${this.API_URL}/guilds/support-snippets?guild_id=${guild_id}`,
      { headers: this.authService.headers });
  }

  /**
   * Creates a new support theme for a specific guild.
   *
   * @param snippet - The ticket snippet object to be created.
   * @returns An Observable emitting the server's response.
   */
  createSnippet(snippet: TicketSnippet): Observable<Object> {
    return this.http.post(`${this.API_URL}/guilds/support-snippets?guild_id=${snippet.guild_id}`, snippet,
      { headers: this.authService.headers });
  }

  /**
   * Fetches the current ongoing ticket announcement for a specific guild.
   *
   * @param guild_id - The ID of the guild for which to fetch the active ticket announcement.
   * @returns An Observable that emits the announcement
   */
  getTicketAnnouncement(guild_id: string): Observable<TicketAnnouncement> {
    return this.http.get<TicketAnnouncement>(`${this.API_URL}/guilds/support-announcement?guild_id=${guild_id}`,
      { headers: this.authService.headers });
  }

  /**
   * Creates a new support theme for a specific guild.
   *
   * @param theme - The support theme object to be created.
   * @param guild_id - The ID of the guild for which the support theme is created.
   * @returns An Observable emitting the server's response.
   */
  createSupportTheme(theme: SupportTheme, guild_id: string): Observable<Object> {
    return this.http.post(`${this.API_URL}/guilds/support-themes?guild_id=${guild_id}`, theme,
      { headers: this.authService.headers });
  }

  /**
   * Edits an existing support theme for a specific guild.
   *
   * @param theme - The support theme object to be updated.
   * @param guild_id - The ID of the guild for which the support theme is being updated.
   * @returns An Observable emitting the server's response.
   */
  editSupportTheme(theme: SupportTheme, guild_id: string): Observable<Object> {
    return this.http.put(`${this.API_URL}/guilds/support-themes?guild_id=${guild_id}`, theme,
      { headers: this.authService.headers });
  }

  /**
   * Deletes a support theme for a specific guild.
   *
   * @param theme - The support theme object to be deleted.
   * @param guild_id - The ID of the guild from which the support theme is deleted.
   * @returns An Observable emitting the server's response.
   */
  deleteSupportTheme(theme: SupportTheme, guild_id: string): Observable<Object> {
    const themeName: string = theme.old_name && theme.old_name !== theme.name ? theme.old_name : theme.name;
    return this.http.delete(
      `${this.API_URL}/guilds/support-themes?guild_id=${guild_id}&theme_name=${encodeURIComponent(themeName)}`,
      { headers: this.authService.headers }
    );
  }

  /**
   * Sends a vote for a bot feature.
   *
   * @param data - The feature vote details to be sent.
   * @returns An Observable that emits the server's response.
   */
  sendFeatureVote(data: FeatureData): Observable<Object> {
    return this.http.post(`${this.API_URL}/progress/features`, data, { headers: this.authService.headers });
  }

  /**
   * Sends a bug report to the server.
   *
   * @param data - The data of the bug report to be sent.
   * @returns An Observable that emits the server's response.
   */
  sendBugReport(data: formGroupBug): Observable<Object> {
    return this.http.post(`${this.API_URL}/contact/bug`, data, { headers: this.authService.headers });
  }

  /**
   * Sends an idea suggestion to the server.
   *
   * @param data - The data of the idea suggestion to be sent.
   * @returns An Observable that emits the server's response.
   */
  sendIdeaSuggestion(data: formGroupIdea): Observable<Object> {
    return this.http.post(`${this.API_URL}/contact/idea`, data, { headers: this.authService.headers });
  }
}
