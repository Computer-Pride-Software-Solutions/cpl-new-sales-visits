import { Injectable } from '@angular/core';
import { environment as envProd} from '../../../environments/environment.prod';
import { environment as envDev} from '../../../environments/environment';
import { from, Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class VisitService {

  private headers = new HttpHeaders();
  private param = new HttpParams();
  currentUser = localStorage.getItem('currentUser');

  constructor(private httpClient: HttpClient) {
    this.headers = this.headers.set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
    // this.param = this.param.append('currentUser', this.currentUser);
  }

  getVisits(hint, {fromDate, toDate}): Observable<any[]> {
    const endpoint = 'visit';
    this.param = this.param.append('from', fromDate);
    this.param = this.param.append('to', toDate);

    let URL = `${envDev.BASE_URL}/${endpoint}${(hint)?`/${hint}`:''}`;
    return this.httpClient.get(`${URL}`, {
      params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data: any[]) => {
        return data;
      }), catchError(error => {
        return throwError(error);
      })
    );
  }

  getOrders(visitId): Observable<any[]> {
    const endpoint = 'orders';
    let URL = `${envDev.BASE_URL}/${endpoint}/${visitId}`;
    return this.httpClient.get(`${URL}`, {
      // params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data: any[]) => {
        return data;
      }), catchError(error => {
        return throwError(error);
      })
    );
  }

}


