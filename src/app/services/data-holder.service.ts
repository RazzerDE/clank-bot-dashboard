import { Injectable } from '@angular/core';
import {GeneralStats} from "./types/Statistics";

@Injectable({
  providedIn: 'root'
})
export class DataHolderService {

  bot_stats: GeneralStats = { user_count: '28.000', guild_count: 350, giveaway_count: 130, ticket_count: 290,
                              punish_count: 110, global_verified_count: '16.000' };

  constructor() { }
}
