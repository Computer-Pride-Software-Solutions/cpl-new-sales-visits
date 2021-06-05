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
    currentUser = localStorage.getItem('currentUser');

    constructor(private httpClient: HttpClient, public alertController: AlertController
      ) {
        this.headers = this.headers.set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
        // this.param = this.param.append('currentUser', this.currentUser);

    }

    getVisits(): Observable<IVisits[]> {
        const endpoint = 'scheduled-visits';
        return this.httpClient.get(`${this.baseUrl}/${endpoint}`, {
            // params: this.param,
            headers : this.headers,
            withCredentials: true
        }).pipe(
          map((data: IVisits[]) => {
            return data;
          }), catchError(error => {
            this.presentAlert("Kindly Swipe Down to Refresh", "Logout then Login or");
            return throwError(error);
          })
        );
    }

    getScheduledVisits(custCode, salesRepCode, date):Observable<any>{
      const endpoint = 'visits/scheduled';
      this.param = this.param.append('visit-date', date);

      return this.httpClient.get(`${this.baseUrl}/${endpoint}/${custCode}/${salesRepCode}`, {
        params: this.param,
        headers : this.headers,
        withCredentials: true
      })
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
        header: 'You have been idle for long!',
        subHeader: `${status}`,
        message: `${msg}`,
        mode: 'ios',
        buttons: ['OK']
      });
  
      await alert.present();
    }

}
