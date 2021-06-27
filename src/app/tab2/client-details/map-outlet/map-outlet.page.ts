import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ClientService } from 'src/app/services/client/client.service';
import { DexieService } from 'src/app/services/Database/Dexie/dexie.service';
import { LocationService } from 'src/app/services/location/location.service';
import { LoadingController } from '@ionic/angular';

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
    public loadingController: LoadingController

    ) { }

  ngOnInit() {
    this.getCurrentLocation();
  }
  @Input() clientName: string;
  @Input() custCode: string;
  async getCurrentLocation(){
    let originLatlng = await this.locationService.getCurrentPosition();
    this.currentLatLong = originLatlng;

  }
  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Mapping client...',
      duration: 1000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    // console.log('Loading dismissed!');
  }

  async mapClient(){
    this.presentLoading();

    this.subscription.add(
      this.clientService.mapClient(this.custCode, this.currentLatLong).subscribe((response)=> {
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
