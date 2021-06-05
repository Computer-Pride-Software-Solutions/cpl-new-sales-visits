import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ClientService } from 'src/app/services/client/client.service';
import { DexieService } from 'src/app/services/Database/Dexie/dexie.service';
import { LocationService } from 'src/app/services/location/location.service';
@Component({
  selector: 'app-map-outlet',
  templateUrl: './map-outlet.page.html',
  styleUrls: ['./map-outlet.page.scss'],
})
export class MapOutletPage implements OnInit {

  currentLatLong: any;
  subscription: Subscription = new Subscription();

  constructor(
    public modalController: ModalController,
    public locationService: LocationService,
    private db: DexieService,
    private clientService: ClientService,
    public alertController: AlertController,

    ) { }

  ngOnInit() {
    this.getCurrentLocation();
  }

  async getCurrentLocation(){
    const currentLocation = await this.db.currentLocation.orderBy('id').last();
    this.currentLatLong = currentLocation?.gps;

  }

  mapClient(custCode, latlong){
    this.subscription.add(
      this.clientService.mapClient(custCode, latlong).subscribe((response)=> {
        this.presentAlert(response['msg'], '');
      })
    )
  }
  async presentAlert(msg, status) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Info',
      subHeader: `${status}`,
      message: `${msg}`,
      mode: 'ios',
      buttons: ['OK']
    });

    await alert.present();
  }

  dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    });
  }
}
