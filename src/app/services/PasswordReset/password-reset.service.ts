import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private baseUrl = environment.BASE_URL;
  private headers = new HttpHeaders();

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    
  ) {
    this.headers = this.headers.set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
   }

   sendOTP(email){
      return this.httpClient.put<any>(`${this.baseUrl}/otp`, {
        email: email
      },{
        headers : this.headers,
        // withCredentials: true
      }).toPromise();
   }

   validateOTP(otpInfo){
    return this.httpClient.post<any>(`${this.baseUrl}/otp`, otpInfo,{
      headers : this.headers,
      // withCredentials: true
    }).toPromise();
   }

   resetPassword(user){
    return this.httpClient.put<any>(`${this.baseUrl}/user`, user,{
      headers : this.headers,
      // withCredentials: true
    }).toPromise();
   }
}
