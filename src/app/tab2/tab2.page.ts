import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { IonInfiniteScroll } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { IClient } from '../interfaces/IClient';
import { ClientService } from '../services/client/client.service';
import { NewClientPage } from './new-client/new-client.page';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  clients: IClient[] = [];
  lc = [];
  subscription: Subscription = new Subscription();
  page = 0;
  hint = '';

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(private clientsService: ClientService, public modalController: ModalController,
    ) {}

  ngOnInit() {
    // loading purchase orders
    this.getClients(this.page);

  }

  ngOnDestroy() {
    // releasing resources
    this.subscription.unsubscribe();
    this.clients = [];
  }

  // Fecthing orders theough the service
  getClients(page: number): void {
    this.subscription = this.clientsService.getClients(page, this.hint)
      .subscribe((data: IClient[]) => {
        this.clients = data;
      }
    );

    // this.lc.push(this.clients);
  }

  // Refreshing page
  doRefresh(event) {
    // Begin async operation
    this.page = 0; // Resetting page number to reload orders
    this.getClients(this.page); // refetch orders
    setTimeout(() => {
      // Async operation has ended
      event.target.complete();
    }, 2000);
  }

  loadData(event) {
    this.clients = []; // Creating space for newly fetched orders
    this.page = this.page + 1; // setting new page to load
    setTimeout(() => {
      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      this.getClients(this.page); // Fetching new orders

    }, 500);
  }


  async presentAddNewClient() {
    const modal = await this.modalController.create({
      component: NewClientPage,
      cssClass: 'my-custom-class',
      mode: 'ios',

    });
    return await modal.present();
  }

  searchClients(event){
    this.hint = event.target.value.toLowerCase();
    // console.log(hint);
    this.getClients(0);
  }



}
