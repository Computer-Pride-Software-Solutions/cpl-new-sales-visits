import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Geolocation, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';

// import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
@Injectable({
  providedIn: 'root'
})
export class LocationService {
 

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
    private toastCtrl: ToastController


  ) {
    this.watchPosition();
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

   watchPosition(){
    this.watch = this.geolocation.watchPosition(this.options);
    this.watch.subscribe((data) => {
      this.currenGPS = `${data.coords.latitude},${data.coords.longitude}`;
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