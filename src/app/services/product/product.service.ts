import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { from, Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { IItemGroup, IProduct } from 'src/app/interfaces/IProducts';
import { AlertController } from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = environment.BASE_URL;
  private headers = new HttpHeaders();
  private param = new HttpParams();
  currentUser = localStorage.getItem('currentUser');
  constructor(private httpClient: HttpClient, public alertController: AlertController) {
    this.headers = this.headers.set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
    // this.param = this.param.append('currentUser', this.currentUser);
  }
  getProductDetails( ItemCode: string, pricelistId:number): Observable<IProduct[]> {
    const endpoint = 'product-details';
    return this.httpClient.get(`${this.baseUrl}/${endpoint}/${ItemCode}/${pricelistId}`, {
      params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data: IProduct[]) => {
        return data;
      }), catchError(error => {
        return throwError('No product found!');
      })
    );
  }

  getItemGroups(): Observable<IItemGroup[]>{
    const endpoint = 'item-groups';
    return this.httpClient.get(`${this.baseUrl}/${endpoint}`, {
      params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data: IItemGroup[]) => {
        return data;
      }), catchError(error => {
        return throwError(error);
      })
    );
  }

  getProducts(itemGroup: string = '', custCode: string): Observable<IProduct[]>{
    this.param = this.param.append('itemGroup', itemGroup);

    const endpoint = 'items';
    return this.httpClient.get(`${this.baseUrl}/${endpoint}${(custCode.length > 1)? '/'+custCode: ''}`, {
      params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data: IProduct[]) => {
        return data;
      }), catchError(error => {
        return throwError(error);
      })
    );
  }



  getSearchedItem(hint: string, custCode: string): Observable<IProduct[]>{
    if(hint.length > 2){
    this.param = this.param.append('hint', hint);
    const endpoint = 'searched-item';
    return this.httpClient.get(`${this.baseUrl}/${endpoint}/${custCode}`, {
      params: this.param,
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data: IProduct[]) => {
        return data;
      }), catchError(error => {
        return throwError('No item found!');
      })
    );
    }
  }

  //methods for new endpoints
  getAllProducts(chunk:number, hint): Observable<IProduct[]>{
    const endpoint = 'products';
    return this.httpClient.get(`${this.baseUrl}/${endpoint}/${chunk}${(hint.length > 1)? '/'+hint: ''}`, {
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data: IProduct[]) => {
        return data;
      }), catchError(error => {
        this.presentAlert(error.error.error, "Kindly logout then login again!");
        return throwError(error);
      })
    );
  }

  // getAllProductsGroups(chunk:number, hint:string = ''): Observable<any[]>{
  //   const endpoint = 'item-group';
  //   return this.httpClient.get(`${this.baseUrl}/${endpoint}/${chunk}${(hint.length > 3)? '/'+hint: ''}`, {
  //     headers : this.headers,
  //     withCredentials: true
  //   }).pipe(
  //     map((data: any[]) => {
  //       return data;
  //     }), catchError(error => {
  //       return throwError(error);
  //     })
  //   );
  // }
  getProductsPerGroup(itemGroup, pricelistId): Observable<any[]>{
    const endpoint = 'items/group';
      return this.httpClient.get(`${this.baseUrl}/${endpoint}/${itemGroup}/${pricelistId}`, {
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

  updateProduct(itemInfo, itemCode){
    const endpoint = 'items';

    return this.httpClient.put(`${this.baseUrl}/${endpoint}/${itemCode}`, itemInfo, {
      headers : this.headers,
      withCredentials: true
    }).pipe(
      map((data) =>
         data
      ), catchError(error => throwError(error))
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


