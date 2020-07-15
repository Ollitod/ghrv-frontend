import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Stat, StatReduced} from '../models/stat';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) {
  }

  findAll(): Observable<Stat[]> {
    return this.http.get<Stat[]>(environment.API_URL + '/allStats');
  }

  findAllGrouped(): Observable<Map<string, StatReduced[]>> {
    return this.http.get<Map<string, StatReduced[]>>(environment.API_URL + '/allStatsGrouped');
  }
}
