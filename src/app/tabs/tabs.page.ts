import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { LocationService } from '../services/location/location.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  constructor(public actionSheetController: ActionSheetController, private locationService: LocationService) {}

  // currentLatLong: string;
  // async getCurrentLocation(){
  //   this.currentLatLong = (this.locationService.currenGPS)? await Promise.resolve(this.locationService.currenGPS) : await this.locationService.getCurrentPosition();
  // }

  ngOnInit() {
    this.locationService.watchPosition();
  }

  async presentActionSheet() {
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
          console.log('Delete clicked');
        }
        }, 
       {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

}
