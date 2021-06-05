import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ClientService } from 'src/app/services/client/client.service';
import { IPriceList } from 'src/app/interfaces/IProducts';
import { DexieService } from 'src/app/services/Database/Dexie/dexie.service';

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


  async addNewClient(): Promise<void>{
    const frm = document.querySelector('#frmNewClient') as HTMLFormElement;
    const fd = new FormData(frm);
    const currentLocation = await this.db.currentLocation.orderBy('id').last();
    const clientInfo = {
      latlong: currentLocation?.gps,
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
