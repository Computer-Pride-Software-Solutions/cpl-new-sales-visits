import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { from, Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { IClient } from 'src/app/interfaces/IClient';
import { IVisits } from 'src/app/interfaces/IVisits';
@Injectable({
  providedIn: 'root'
})
export class AssignedVisitsService {
    private baseUrl = environment.BASE_URL;
    private headers = new HttpHeaders();
    private param = new HttpParams();
    currentUser = sessionStorage.getItem('currentUser');

    constructor(private httpClient: HttpClient, public alertController: AlertController
      ) {
        this.headers = this.headers.set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
        // this.param = this.param.append('currentUser', this.currentUser);

    }

    getVisits(salesRep): Observable<IVisits[]> {
        const endpoint = 'visits';
        return this.httpClient.get(`${this.baseUrl}/${endpoint}/${salesRep}`, {
            // params: this.param,
            headers : this.headers,
            withCredentials: true
        }).pipe(
          map((data: IVisits[]) => {
            return data;
          }), catchError(error => {
            this.presentAlert(error.error.error, "Kindly logout then login again!");
            return throwError(error);
          })
        );
    }

    checkScheduledVisits(custCode, salesRepCode, date):Observable<any>{
      const endpoint = 'visits/assigned';
      this.param = this.param.append('visit-date', date);

      return this.httpClient.get(`${this.baseUrl}/${endpoint}/${custCode}/${salesRepCode}`, {
        params: this.param,
        headers : this.headers,
        withCredentials: true
      });
    }

    getClientDetails(clientName: string): Observable<IClient[]> {
        const endpoint = 'client';
        return this.httpClient.get(`${this.baseUrl}/${endpoint}/${clientName}`, {
            // params: this.param,
            headers : this.headers,
            withCredentials: true
        }).pipe(
          map((data: IClient[]) => {
            return data;
          }), catchError(error => {
            this.presentAlert(error.error.error, "Unknown Error!");
            return throwError(error);
          })
        );
    }

    async presentAlert(msg, status) {
      const alert = await this.alertController.create({
        cssClass: 'secondary',
        header: 'We are unable to fetch the latest information!',
        subHeader: `${status}`,
        message: `${msg}`,
        mode: 'ios',
        buttons: ['OK']
      });
  
      await alert.present();
    }

}
