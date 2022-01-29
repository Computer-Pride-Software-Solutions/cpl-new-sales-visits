import { Injectable } from '@angular/core';
import { environment as envProd} from '../../../environments/environment.prod';
import { environment as envDev} from '../../../environments/environment';
import { from, Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';




@Injectable({
  providedIn: 'root'
})

export class VisitSummaryService {
  private headers = new HttpHeaders();
  private param = new HttpParams();
  currentUser = sessionStorage.getItem('currentUser');

  constructor(private httpClient: HttpClient) {
    this.headers = this.headers.set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
    // this.param = this.param.append('currentUser', this.currentUser);
  }

  getVisitsSummary(custName, visitDate): Observable<any[]> {
    const endpoint = 'visit-summary';
    this.param = this.param.append('visitDate', visitDate);
    let URL = `${envDev.BASE_URL}/${endpoint}/${custName}`;
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

  

}
