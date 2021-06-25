import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { from, Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Geolocation, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { DexieService } from '../Database/Dexie/dexie.service';

// import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {
  private baseUrl = environment.BASE_URL;
  private headers = new HttpHeaders();
  private param = new HttpParams();

  watch;
  options = {
    maximumAge: 2000,
    timeout: 9000,
    enableHighAccuracy: true
  };
  currentLatLon;
  isLoading = false;


  constructor(
    private geolocation: Geolocation,
    public alertController: AlertController,
    private toastCtrl: ToastController,
    private db: DexieService,
    private httpClient: HttpClient,

  ) {
    this.headers = this.headers.set('Content-Type', 'application/json').set('Accept', 'application/json');

    // this.getCurrentLatLon();
   }
  ngOnDestroy(): void {
    // this.watch.unsubscribe();
    // this.clearLocationDetails();
  }

   getCurrentPosition(){   
     return new Promise((resolve, reject) => {
      this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {
        const currenGPS = `${pos.coords.latitude},${pos.coords.longitude}`;
        resolve(currenGPS);
     }, (err: PositionError) => {
       this.presentAlert('Please turn on your location', err.message);
       this.isLoading = false;
       reject(err.message);
      });
     });
   }


  async clearLocationDetails(){
    await this.db.transaction('rw', this.db.currentLocation, function () {
      this.db.currentLocation.clear();
    });
  }

   watchPosition(){
    this.watch = this.geolocation.watchPosition(this.options);
    this.watch.subscribe(async (data) => {
      await this.db.transaction('rw', this.db.currentLocation, async function () {
        this.db.currentLocation.put(
          {
            lat: data.coords?.latitude,
            long: data.coords?.longitude,
            gps: `${data.coords?.latitude},${data.coords?.longitude}`
          }
        );
      });
    }),
    (err) => {
      this.presentToast(err.message);
     }

   }



   async presentToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      cssClass: 'toast'
    });
    toast.present();
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