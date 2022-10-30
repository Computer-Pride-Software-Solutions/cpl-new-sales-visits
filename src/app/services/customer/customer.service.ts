import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private baseUrl = environment.BASE_URL;
  private headers = new HttpHeaders();

  constructor(private httpClient: HttpClient) {
    this.headers = this.headers.set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
   }

   getCustomer(customerId) {
    const endpoint = 'customers';
    let URL = `${this.baseUrl}/${endpoint}/${customerId}`;

    let promise = new Promise((resolve, reject) => {
      this.httpClient.get(URL, {
          headers : this.headers,
          withCredentials: true
        })
        .toPromise()
        .then((res) => resolve(res));
    });
    return promise;
  }
}
