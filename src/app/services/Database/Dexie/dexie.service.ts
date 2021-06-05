import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import 'dexie-observable';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DexieService extends Dexie {

  draftReport: Dexie.Table<IDrafReport, number>;
  currentLocation: Dexie.Table<ICurrentUserLocation, number>;



  constructor(private toastCtrl: ToastController) {
    super("dev.tomashi.salesvisits");
    
        let db = this;

        db.version(1).stores({
            draftReport: '&clientCode, clientName, date, report',
            currentLocation: '++id, lat, long, gps'
        });
        db.version(2).stores({});

        this.draftReport = this.table("draftReport");
        this.currentLocation = this.table("currentLocation");

        db.on('changes', function (changes) {
          changes.forEach(function (change) {
            switch (change.type) {
              case 1: // CREATED
                // db.presentToast("Record created successfuly!");
                break;
              case 2: // UPDATED
                db.presentToast("Record updated successfully!");
                break;
              case 3: // DELETED
                db.presentToast("Record deleted successfully!");
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

export interface ICurrentUserLocation{
  id?: number;
  lat: string;
  long: string;
  gps: string;
}


export var db = new DexieService(null);
