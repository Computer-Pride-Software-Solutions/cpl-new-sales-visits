import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ClientService } from 'src/app/services/client/client.service';
import { IPriceList } from 'src/app/interfaces/IProducts';
import { DexieService } from 'src/app/services/Database/Dexie/dexie.service';
import { LocationService } from 'src/app/services/location/location.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-new-client',
  templateUrl: './new-client.page.html',
  styleUrls: ['./new-client.page.scss'],
})
export class NewClientPage implements OnInit, OnDestroy {

  subscription: Subscription = new Subscription();

  pricelists: IPriceList[] = [];

  constructor(
    public modalController: ModalController,
    private clientService: ClientService,
    private db: DexieService,
    public alertController: AlertController,
    private locationService: LocationService,
    public loadingController: LoadingController
  ) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.getPriceList();
  }


  dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    });
  }
  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 4000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
  }

  async addNewClient(): Promise<void>{
    this.presentLoading();
    const frm = document.querySelector('#frmNewClient') as HTMLFormElement;
    const fd = new FormData(frm);
    let originLatlng = await this.locationService.getCurrentPosition();
    const clientInfo = {
      latlong: originLatlng,
    };
    for (const key of fd.keys()) {
      if(fd.get(key).toString().length > 0){
        clientInfo[key] = fd.get(key);
      }
    }
    this.subscription.add(
      this.clientService.addNewClient(clientInfo).subscribe( response => {
        this.presentAlert(response["msg"], "");
      })
    );
  }


  getPriceList(): void{
    this.subscription.add(
      this.clientService.getPriceList().subscribe( pricelist => {
        this.pricelists = pricelist;
        // console.log(JSON.stringify(this.pricelists));
      })
    );
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


}
