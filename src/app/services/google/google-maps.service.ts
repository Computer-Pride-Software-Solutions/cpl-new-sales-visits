import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
    private baseUrl = environment.BASE_URL;
    private headers = new HttpHeaders();
    private param = new HttpParams();

  constructor(private httpClient: HttpClient) { }

  getDistanceMatrix(originLatlng, destinationLatlng){
    const endpoint = 'distance';
    this.param = this.param.append('origin-latlng', originLatlng);
    this.param = this.param.append('destination-latlng', destinationLatlng);

    return this.httpClient.get(`${this.baseUrl}/${endpoint}`, {
        params: this.param,
        headers : this.headers,
        withCredentials: true
    });
  }


}
