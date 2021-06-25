import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { from, Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { IClient, IClientDetails } from 'src/app/interfaces/IClient';
import { IItemGroup, IPriceList, IProduct } from 'src/app/interfaces/IProducts';
import { IDeliveryDetails } from 'src/app/interfaces/IDelivery';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseUrl = environment.BASE_URL;
  private headers = new HttpHeaders();
  private param = new HttpParams();
  currentUser = localStorage.getItem('currentUser');

  constructor(private httpClient: HttpClient, public alertController: AlertController) {
    this.headers = this.headers.set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
    // this.param = this.param.append('currentUser', this.currentUser);
  }

  getClients(page: number, hint: string): Observable<IClient[]> {
    const endpoint = 'clients';
    let URL = `${this.baseUrl}/${endpoint}/${page}`;
    if (hint.length > 0){
      URL = `${this.baseUrl}/${endpoint}/${page}/${hint}`;
    }
    return this.httpClient.get(`${URL}`, {
      params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data: IClient[]) => {
        return data;
      }), catchError(error => {
        this.presentAlert("Kindly Swipe Down to Refresh", "Logout then Login or");

        return throwError(error);
      })
    );
  }

  getClientDetails(custCode: string): Observable<IClientDetails[]> {
    const endpoint = 'client-details';
    return this.httpClient.get(`${this.baseUrl}/${endpoint}/${custCode}`, {
      params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data: IClientDetails[]) => {
        return data;
      }), catchError(error => {
        return throwError('No client found!');
      })
    );
  }
  
  addNewClient(clientInfo: any){
    const endpoint = 'client';
    // this.param = this.param.append('clientInfo', clientInfo);
    return this.httpClient.post(`${this.baseUrl}/${endpoint}`, clientInfo, {
      // params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data) => {
        return data;
      }), catchError(error => {
        return throwError(error);
      })
    );
  }

  getPriceList(): Observable<IPriceList[]>{
    const endpoint = 'pricelist';
    return this.httpClient.get(`${this.baseUrl}/${endpoint}`, {
      // params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data: IPriceList[]) => {
        return data;
      }), catchError(error => {
        return throwError('No client found!');
      })
    );
  }

  getDeliveryCode(custCode): Observable<IDeliveryDetails[]>{
    const endpoint = 'delivery-code';
    return this.httpClient.get(`${this.baseUrl}/${endpoint}/${custCode}`, {
      // params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data: IDeliveryDetails[]) =>{
        return data;
      }), catchError(error => {
        return throwError(error);
      })
    );
  }

  mapClient(custCode: string, latlon: string){
    const endpoint = 'client';
    return this.httpClient.put(`${this.baseUrl}/${endpoint}/${custCode}`, {
      latlong: latlon
    }, {
      headers : this.headers,
      withCredentials: true
    })
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
