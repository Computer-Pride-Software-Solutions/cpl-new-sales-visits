import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable, Subject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Url } from 'url';
import { environment } from '../../../environments/environment';



import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private baseUrl = environment.BASE_URL;

  private headers = new HttpHeaders();

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    public alertController: AlertController
    ) {
    this.headers = this.headers.set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
   }

  loginUser(email: string, password: string) {
    let param = new HttpParams();
    param = param.append('appcode', 'SalesVisit');
    param = param.append('email', email);
    param = param.append('password', password);
    return this.httpClient.get(`${this.baseUrl}/login`, {
      headers: this.headers,
      params: param,
      withCredentials: true
    }).pipe(map(auth => {
        if (!auth['isAuthenticated']) {
          return false;
        }
        localStorage.setItem('currentUser', JSON.stringify(auth));

        this.router.navigate(['/tabs/tab1']);
        return auth;
    }), catchError( error => {
      
      this.presentAlert(`Wrong credentials, please try again! ${error.error.error}`, '');
      return throwError( error );
    }));

  }
  authenticateUser(): Observable<boolean> {
    return this.httpClient.get(`${this.baseUrl}/authenticate`, {
      headers: this.headers,
      withCredentials: true
    }).pipe(map(auth => {
      let username: string;
      if(localStorage.getItem("currentUser")){
        username = JSON.parse(localStorage.getItem("currentUser")).username;
      }
      if(!auth['isAuthenticated']){
        this.presentAlert(`${auth['msg']}`, '');
        localStorage.removeItem("currentUser");
        return auth['isAuthenticated'];
      }
      localStorage.setItem("currentUser", JSON.stringify({
        "isAuthenticated" : auth['isAuthenticated'],
        "username": username
      }));
     return auth['isAuthenticated'];
    }),catchError( error => {
        return throwError( error );
    }));
  }

  auth(): Observable<boolean> {
    var subject = new Subject<boolean>();
    this.authenticateUser().subscribe(auth => {
      // console.log(auth['isAuthenticated']);
      subject.next(auth['isAuthenticated']);
    });
      return subject.asObservable();
  }


  async presentAlert(msg, status) {
    const alert = await this.alertController.create({
      cssClass: 'secondary',
      header: 'Failed!',
      subHeader: `${status}`,
      message: `${msg}`,
      mode: 'ios',
      buttons: ['OK']
    });

    await alert.present();
  }
}
