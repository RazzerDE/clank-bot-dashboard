import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {GeneralStats} from "./types/Statistics";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly API_URL: string = 'http://localhost:8081';

  constructor(private http: HttpClient) { }

  getGeneralStats(): Observable<GeneralStats> {
    return this.http.get<GeneralStats>(`${this.API_URL}/stats/general`);
  }
}
