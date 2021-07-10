import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UserDialogsService {

  constructor( 
      public alertController: AlertController,
    ) { }

  async confirm(msg, header, action){
    const self = this;
    const alert = await this.alertController.create({
      header: header,
      message: msg,
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
            action(self);
          }
        }
      ]
    });
  
    await alert.present();
  }
}
