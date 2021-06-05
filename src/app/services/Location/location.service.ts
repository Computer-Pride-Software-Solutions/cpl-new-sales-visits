import { Injectable, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Geolocation, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { DexieService } from '../Database/Dexie/dexie.service';

// import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {
 

  watch;
  options = {
    maximumAge: 2000,
    timeout: 5000,
    enableHighAccuracy: true
  };
  currenGPS;
  isLoading = false;


  constructor(
    private geolocation: Geolocation,
    public alertController: AlertController,
    private toastCtrl: ToastController,
    private db: DexieService

  ) {
    // this.watchPosition();
    this.clearLocationDetails()

   }
  ngOnDestroy(): void {
    this.watch.unsubscribe();
    this.clearLocationDetails()
  }

  //  getCurrentPosition(){   
  //    return new Promise((resolve, reject) => {
  //     this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {
  //       const currenGPS = `${pos.coords.latitude},${pos.coords.longitude}`;
  //       resolve(currenGPS);
  //    }, (err: PositionError) => {
  //      this.presentAlert('Please turn on your location', err.message);
  //      this.isLoading = false;
  //      reject(err.message);
  //     });
  //    });
  //  }

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

   distance(lat1, lat2, lon1, lon2){
    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 =  lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
    + Math.cos(lat1) * Math.cos(lat2)
    * Math.pow(Math.sin(dlon / 2),2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;

    // calculate the result
    return(c * r).toFixed(2);
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