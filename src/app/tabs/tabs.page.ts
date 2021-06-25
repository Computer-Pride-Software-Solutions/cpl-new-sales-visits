import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { LocationService } from '../services/location/location.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  constructor(public actionSheetController: ActionSheetController,
     private locationService: LocationService,
     private router: Router,
     public alertController: AlertController,
    ) {}

  // currentLatLong: string;
  // async getCurrentLocation(){
  //   this.currentLatLong = (this.locationService.currenGPS)? await Promise.resolve(this.locationService.currenGPS) : await this.locationService.getCurrentPosition();
  // }

  ngOnInit() {
    // this.locationService.watchPosition();
  }

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
