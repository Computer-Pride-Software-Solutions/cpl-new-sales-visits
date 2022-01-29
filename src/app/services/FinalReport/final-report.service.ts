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
  currentUser = sessionStorage.getItem('currentUser');
  constructor(private httpClient: HttpClient) {
    this.headers = this.headers.set('Accept', 'application/json');
    // this.param = this.param.append('currentUser', this.currentUser);
   }


  submitFinalReport(report, custCode){
    // const fd = new FormData();
    // if (Object.keys(finalReport.payment).length > 0){
    //   fd.append('file', finalReport?.payment?.proofOfPayment, finalReport?.payment?.proofOfPayment?.name);
    // }

    const endpoint = 'visits';
    // this.param = this.param.append('gps', gps);
    // this.param = this.param.append('finalReport', JSON.stringify(finalReport));// Passing large data query parameters might be the reason why users are not able to submit more than 30 items
    // this.param = this.param.append('salesRep', salesRep);
    return this.httpClient.post(`${this.baseUrl}/${endpoint}/${custCode}`, report, {
      // params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data) =>
        // alert(data['msg']);
         data
      ), catchError(error => throwError(error))
    );
  }

}
