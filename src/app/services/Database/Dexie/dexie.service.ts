import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import 'dexie-observable';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DexieService extends Dexie {

  draftReport: Dexie.Table<IDrafReport, number>;


  constructor(private toastCtrl: ToastController) {
    super("dev.tomashi.salesvisits");
    
        let db = this;

        db.version(1).stores({
            draftReport: '&clientCode, clientName, date, report',
        });
        db.version(2).stores({});

        this.draftReport = this.table("draftReport");

        db.on('changes', function (changes) {
          changes.forEach(function (change) {
            switch (change.type) {
              case 1: // CREATED
                db.presentToast("Report successfully saved as draft!");
                break;
              case 2: // UPDATED
                db.presentToast("Report updated successfully!");
                break;
              case 3: // DELETED
                db.presentToast("Report deleted successfully!");
              break;
            }
          });
        });

   }

   async presentToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      mode: 'ios',
      cssClass: 'toast'
    });
    toast.present();
  }
}

export interface IDrafReport{
  id: number;
  clientCode: String;
  clientName: string;
  date: string;
  report: any;
}


export var db = new DexieService(null);
