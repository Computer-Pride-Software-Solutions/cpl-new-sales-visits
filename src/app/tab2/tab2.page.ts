import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { IonInfiniteScroll } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { IClient } from '../interfaces/IClient';
import { ClientService } from '../services/client/client.service';
import { NewClientPage } from './new-client/new-client.page';
import { DexieService } from '../services/Database/Dexie/dexie.service';
import { FormControl, Validators } from '@angular/forms';
import { debounce, debounceTime } from 'rxjs/operators';
import { LocationService } from '../services/Location/location.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy, AfterViewInit {

  clients: IClient[] = [];
  lc = [];
  subscription: Subscription = new Subscription();
  page = 0;
  // hint = '';
  clientHint = new FormControl('', [Validators.minLength(3), Validators.min(3)]);

  isLoading = true;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(
    private clientsService: ClientService,
    public modalController: ModalController,
    private locationService: LocationService,
    private db: DexieService,
  ) {

  }
  ngAfterViewInit(): void {
    this.searchClients();
  }

  ngOnInit() {
    this.watchPosition();
    // loading purchase orders
    // this.getClients(this.page);
  }

  ngOnDestroy() {
    // releasing resources
    // this.subscription.unsubscribe();
    this.clients = [];
    this.locationService.clearLocationDetails();
    // this.locationService?.watch?.unsubscribe();
  }

  async watchPosition(){  


    this.locationService.watch.subscribe(async (data) => {

      await this.db.transaction('rw', this.db.currentLocation, async function () {
        this.db.currentLocation.toCollection().last().then(async (latestCoordinates)=> {
            if(!latestCoordinates || latestCoordinates === undefined){
              this.db.currentLocation.put(
                {
                  lat: data.coords?.latitude,
                  long: data.coords?.longitude,
                  gps: `${data.coords?.latitude},${data.coords?.longitude}`
                }
              );
            }else{
              this.db.currentLocation.where(":id").equals(latestCoordinates.id).modify(
                {
                  lat: data.coords?.latitude,
                  long: data.coords?.longitude,
                  gps: `${data.coords?.latitude},${data.coords?.longitude}`
                }
              )
            }     
    
        });
      });

    });

    // this.locationService.watch.subscribe(async (data) => {
    //  await this.db.transaction('rw', this.db.currentLocation, async function () {
    //    if(data.coords !== undefined){
    //      this.db.currentLocation.put(
    //        {
    //          lat: data.coords?.latitude,
    //          long: data.coords?.longitude,
    //          gps: `${data.coords?.latitude},${data.coords?.longitude}`
    //        }
    //      );
    //    }     
    //  });
    // });
 }

  // Fecthing orders theough the service
  getClients(page: number, hint): void {
    this.isLoading = true;
    this.subscription = this.clientsService.getClients(page, hint)
      .subscribe((data: IClient[]) => {
        this.clients = data;
        this.isLoading = false;
      }
    );

    // this.lc.push(this.clients);
  }

  // Refreshing page
  doRefresh(event) {
    // Begin async operation
    this.page = 0; // Resetting page number to reload orders
    this.getClients(this.page, this.clientHint.value); // refetch orders
    setTimeout(() => {
      // Async operation has ended
      event.target.complete();
    }, 700);
  }

  loadData(event) {
    this.clients = []; // Creating space for newly fetched orders
    this.page = this.page + 1; // setting new page to load
    setTimeout(() => {
      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      this.getClients(this.page, this.clientHint.value); // Fetching new orders

    }, 200);
  }


  async presentAddNewClient() {
    const modal = await this.modalController.create({
      component: NewClientPage,
      cssClass: 'my-custom-class',
      mode: 'ios',

    });
    return await modal.present();
  }

  searchClients(){
    
    this.getClients(0, this.clientHint.value);

    const result = this.clientHint.valueChanges.pipe(debounceTime(600));
    result.subscribe((hint) => this.getClients(0, hint.toLowerCase()));
  }



}
