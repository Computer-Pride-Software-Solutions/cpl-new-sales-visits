import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    public alertController: AlertController,
  ) { }


  async confirmDialog(header, msg, action) {
    const self = this;
    const alert = await this.alertController.create({
      header: `${header}`,
      message: `${msg}`,
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
            action();
          }
        }
      ]
    });

    await alert.present();
  }
}
