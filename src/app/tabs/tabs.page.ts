import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { DexieService } from '../services/Database/Dexie/dexie.service';
import { LocationService } from '../services/location/location.service';
import { Geolocation} from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, OnDestroy {

  constructor(public actionSheetController: ActionSheetController,
     private locationService: LocationService,
     private router: Router,
     public alertController: AlertController,
     private db: DexieService,
      public geolocation: Geolocation

    ) {

    }
  ngOnDestroy(): void {
    // this.locationService.clearLocationDetails();
    // this.locationService.watch?.unsubscribe();
  }


  ngOnInit() {
    // this.watchPosition();
  }

  // async watchPosition(){  

  //    this.locationService.watch.subscribe(async (data) => {
  //     await this.db.transaction('rw', this.db.currentLocation, async function () {
  //       if(data.coords !== undefined){
  //         this.db.currentLocation.put(
  //           {
  //             lat: data.coords?.latitude,
  //             long: data.coords?.longitude,
  //             gps: `${data.coords?.latitude},${data.coords?.longitude}`
  //           }
  //         );
  //       }     
  //     });
  //    });
  // }

  async presentActionSheet() {
    const self = this;
    const actionSheet = await this.actionSheetController.create({
      header: 'MORE OPTIONS',
      cssClass: 'my-custom-class',
      mode:'ios',
      buttons: [
        {
        text: 'LOGOUT',
        role: 'destructive',
        icon: 'log-out-outline',
        handler: () => {
          self.confirmLogout()
        }
        }, 
       {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
  }

  async confirmLogout() {
    const self = this;
    const alert = await this.alertController.create({
      header: `Logging out!`,
      message: `Confirm that you meant to logout.`,
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            return false;
          }
        }, {
          text: 'Confirm',
          handler: () => {
            localStorage.removeItem('currentUser');
            self.router.navigate(['/login']);
          }
        }
      ]
    });
  
    await alert.present();
  }

}
