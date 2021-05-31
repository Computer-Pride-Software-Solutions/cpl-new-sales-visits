import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { from, Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FinalReportService {
  private baseUrl = environment.BASE_URL;
  private headers = new HttpHeaders();
  private param = new HttpParams();
  currentUser = localStorage.getItem('currentUser');
  constructor(private httpClient: HttpClient) {
    this.headers = this.headers.set('Accept', 'application/json');
    // this.param = this.param.append('currentUser', this.currentUser);
   }


  submitFinalReport(finalReport, gps, custCode, salesRep){
    const fd = new FormData();
    if (Object.keys(finalReport.payment).length > 0){
      fd.append('file', finalReport?.payment?.proofOfPayment, finalReport?.payment?.proofOfPayment?.name);
    }

    const endpoint = 'final-report';
    this.param = this.param.append('gps', gps);
    this.param = this.param.append('finalReport', JSON.stringify(finalReport));
    this.param = this.param.append('salesRep', salesRep);
    return this.httpClient.post(`${this.baseUrl}/${endpoint}/${custCode}`, fd, {
      params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data) => {
        // alert(data['msg']);
        return data;
      }), catchError(error => {
        return throwError(error);
      })
    );
  }

}
