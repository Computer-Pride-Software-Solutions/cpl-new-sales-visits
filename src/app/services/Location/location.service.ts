import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Geolocation, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { DexieService } from '../Database/Dexie/dexie.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy, OnInit {

  watch;
  options = {
    maximumAge: 5000,
    timeout: 8000,
    enableHighAccuracy: true
  };
  currentLatLon;
  isLoading = false;


  constructor(
    private geolocation: Geolocation,
    public alertController: AlertController,
    private toastCtrl: ToastController,
    private db: DexieService,

  ) {
    this.watch = this.geolocation.watchPosition(this.options);
   }
  ngOnDestroy(): void {
    this.watch.unsubscribe();
    this.clearLocationDetails();
  }
  
  ngOnInit(){

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