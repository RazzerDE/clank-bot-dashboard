import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {config} from "../../../environments/config";
import { HttpClient } from "@angular/common/http";
import {Channel, Guild, Role} from "../types/discord/Guilds";
import {SupportThemeResponse} from "../types/Tickets";

@Injectable({
  providedIn: 'root'
})
export class ComService {

  constructor(private http: HttpClient) {}

  /**
   * Retrieves the list of guilds the user is a member of.
   *
   * This method ensures that the service is initialized before making the request.
   * It makes a GET request to the internal API to fetch the guilds, including member counts.
   *
   * @returns {Promise<Observable<Guild[]>>} A promise that resolves to an observable of the list of guilds.
   */
  async getGuilds(): Promise<Observable<Guild[]>> {
    return this.http.get<Guild[]>(`${config.api_url}/guilds`, { withCredentials: true });
  }

  /**
   * Retrieves the list of emojis for a specific guild.
   *
   * This method ensures that the service is initialized before making the request.
   * It makes a GET request to the internal API to fetch the emojis for the specified guild.
   *
   * @param {string} guild_id - The ID of the guild to fetch emojis for.
   * @returns {Promise<Observable<any>>} A promise that resolves to an observable of the list of emojis.
   */
  async getGuildEmojis(guild_id: string): Promise<Observable<any>> {
    return this.http.get<any>(`${config.api_url}/guilds/emojis?guild_id=${guild_id}`,
      { withCredentials: true });
  }

  /**
   * Retrieves the list of roles for a specific guild.
   *
   * This method ensures that the service is initialized before making the request.
   * It makes a GET request to the internal API to fetch the roles for the specified guild.
   *
   * @param {string} guild_id - The ID of the guild to fetch roles for.
   * @returns {Promise<Observable<Role[]>>} A promise that resolves to an observable of the list of roles.
   */
  async getGuildRoles(guild_id: string): Promise<Observable<Role[]>> {
    return this.http.get<Role[]>(`${config.api_url}/guilds/roles?guild_id=${guild_id}`,
      { withCredentials: true });
  }

  /**
   * Retrieves the list of channels for a specific guild.
   *
   * This method ensures that the service is initialized before making the request.
   * It makes a GET request to the internal API to fetch the channels for the specified guild.
   *
   * @param {string} guild_id - The ID of the guild to fetch channels for.
   * @returns {Promise<Observable<any>>} A promise that resolves to an observable of the list of channels.
   */
  async getGuildChannels(guild_id: string): Promise<Observable<Channel[]>> {
    return this.http.get<Channel[]>(`${config.api_url}/guilds/channels?guild_id=${guild_id}`,
      { withCredentials: true });
  }

  /**
   * Retrieves the list of all support-themes for a specific guild.
   *
   * This method ensures that the service is initialized before making the request.
   * It makes a GET request to the internal API to fetch the guilds, including member counts.
   *
   * @returns {Promise<Observable<SupportThemeResponse>>} A promise that resolves to an observable of the list of guilds.
   */
  async getSupportThemes(guild_id: string): Promise<Observable<SupportThemeResponse>> {
    return this.http.get<SupportThemeResponse>(`${config.api_url}/guilds/support-themes?guild_id=${guild_id}`,
      { withCredentials: true });
  }


  /**
   * Retrieves the team roles for a specific guild.
   *
   * This method ensures that the service is initialized before making the request.
   * It makes a GET request to the internal API to fetch the team roles for the specified guild.
   *
   * @param {string} guild_id - The ID of the guild to fetch team roles for.
   * @returns {Promise<Observable<Role[]>>} A promise that resolves to an observable of the list of team roles.
   */
  async getTeamRoles(guild_id: string): Promise<Observable<any>> {
    return this.http.get<Role[]>(`${config.api_url}/guilds/team?guild_id=${guild_id}`,
      { withCredentials: true });
  }

  /**
   * Removes a team role from a specific guild.
   *
   * This method ensures that the service is initialized before making the request.
   * It makes a DELETE request to the internal API to remove the specified team role
   * from the specified guild.
   *
   * @param {string} guild_id - The ID of the guild to remove the team role from.
   * @param {string} role_id - The ID of the role to be removed.
   * @returns {Promise<Observable<any>>} A promise that resolves to an observable of the result.
   */
  async removeTeamRole(guild_id: string, role_id: string): Promise<Observable<any>> {
    return this.http.delete(`${config.api_url}/guilds/team?guild_id=${guild_id}&role_id=${role_id}`,
      { withCredentials: true });
  }

  /**
   * Adds a team role to a specific guild.
   *
   * This method ensures that the service is initialized before making the request.
   * It makes a POST request to the internal API to add the specified team role
   * to the specified guild.
   *
   * @param {string} guild_id - The ID of the guild to add the team role to.
   * @param {string} role_id - The ID of the role to be added.
   * @param {string} level - The support level of the role to be added.
   * @returns {Promise<Observable<any>>} A promise that resolves to an observable of the result.
   */
  async addTeamRole(guild_id: string, role_id: string, level: string): Promise<Observable<any>> {
    return this.http.post(`${config.api_url}/guilds/team?guild_id=${guild_id}&role_id=${role_id}&level=${level}`, {},
      { withCredentials: true });
  }

  /**
   * Updates the default mention roles for a specific guild.
   *
   * This method ensures that the service is initialized before making the request.
   * It makes a POST request to the internal API to update the default mention roles
   * for the specified guild.
   *
   * @param {string} guild_id - The ID of the guild to update the default mention roles for.
   * @param {string[]} role_ids - An array of role IDs to set as the default mention roles.
   * @returns {Promise<Observable<any>>} A promise that resolves to an observable of the result.
   */
  async changeDefaultMention(guild_id: string, role_ids: string[]): Promise<Observable<any>> {
    return this.http.post(`${config.api_url}/guilds/support-themes/default-mention?guild_id=${guild_id}`, { role_ids },
      { withCredentials: true });
  }

  /**
   * Sets the support forum channel for a specific guild.
   *
   * This method ensures that the service is initialized before making the request.
   * It makes a POST request to the internal API to set the support forum channel
   * for the specified guild.
   *
   * @param {string} guild_id - The ID of the guild to set the support forum channel for.
   * @param {string} channel_id - The ID of the channel to be set as the support forum.
   * @returns {Promise<Observable<any>>} A promise that resolves to an observable of the result.
   */
  async setSupportForum(guild_id: string, channel_id: string): Promise<Observable<any>> {
    return this.http.post(`${config.api_url}/guilds/support-forum?guild_id=${guild_id}&channel_id=${channel_id}`, {},
      { withCredentials: true });
  }
}
