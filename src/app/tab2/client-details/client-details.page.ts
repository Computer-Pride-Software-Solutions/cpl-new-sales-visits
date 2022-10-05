/* eslint-disable max-len */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
// import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { IonicSelectableComponent } from 'ionic-selectable';
import { IClientDetails } from 'src/app/interfaces/IClient';
import { IItemGroup, IProduct } from 'src/app/interfaces/IProducts';
import { IDeliveryDetails } from 'src/app/interfaces/IDelivery';
import { ClientService } from 'src/app/services/client/client.service';
import { FinalReportPage } from './final-report-page/final-report.page';
import { DexieService } from 'src/app/services/Database/Dexie/dexie.service';
import { ProductService } from 'src/app/services/product/product.service';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { MapOutletPage } from './map-outlet/map-outlet.page';
import { AssignedVisitsService } from 'src/app/services/assigned-visits/assigned-visits.service';
import { GoogleMapsService } from 'src/app/services/google/google-maps.service';
// import { IVisits } from 'src/app/interfaces/IVisits';


import { Camera, CameraResultType } from '@capacitor/camera';
import { DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { UserDialogsService } from 'src/app/services/common/user-dialogs/user-dialogs.service';
import { FormControl, Validators } from '@angular/forms';

// import { IonRouterOutlet, Platform } from '@ionic/angular';
// import { Plugins } from '@capacitor/core';

import {format} from 'date-fns';
import { LocationService } from 'src/app/services/Location/location.service';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.page.html',
  styleUrls: ['./client-details.page.scss'],
})
export class ClientDetailsPage implements OnInit, OnDestroy {
  currentLatLong: any;
  // today: String = new Date().toISOString();
  today = new Date().toJSON().slice(0,10);

  clientDetails: IClientDetails[] = [];
  itemGroups: IItemGroup[] = [];
  itemGroup: IItemGroup;

  products: IProduct[] = [];
  product: IProduct;

  itemOnOffer: IProduct[] = [];

  deliveryDetails: IDeliveryDetails[] = [];
  deliveryDetail: IDeliveryDetails;

  subscription: Subscription = new Subscription();
  custCode = this.activatedRoute.snapshot.paramMap.get('custCode');

  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  currentlySelectedItem: string;
  currentlySelectedItemId: number;
  currentlySelectedSalesPriceExcl: number;
  currentlySelectedIncPrice: number;
  vatValue: number;
  currentlySelectedItemGroup: string;

  currentlySelectedDeliveryCode: string;
  otherCustomerference = new FormControl('');


  finalReport = {
    clientDetails: {
      otherReference: '',
    },
    stock : [],
    offers: {},
    returns: [],
    orders: [],
    payment: {},
    comments: {}
  };

  pictureB64: any;
  src : SafeResourceUrl = 'assets/images/sample-cheque.jpeg';
  submit = false;
  isLoading = true;



  // photo :SafeResourceUrl;
  constructor(public actionSheetController: ActionSheetController,
    private activatedRoute: ActivatedRoute,
    private clientService: ClientService,
    private productService: ProductService,
    public alertController: AlertController,
    public modalController: ModalController,
    private toastCtrl: ToastController,
    private db: DexieService,
    // private camera: Camera,
    private locationService: LocationService,
    private assignedVisitsService: AssignedVisitsService,
    private googleMapService: GoogleMapsService,
    private sanitizer: DomSanitizer,
    private dialogServices: UserDialogsService,

    ) { 
    //  this.locationService.watchPosition();
    }
    @ViewChild(IonSlides) slides: IonSlides;


  ngOnInit() {
    this.getCurrentLocation();
    this.getClientDetails();
    // this.getDistanceMatrix();
    this.getItemGroup();
    this.getDeliveryCode();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeItem(itemName){
   this.dialogServices.confirm(`Confirm that you meant to remove ${itemName} from the final report!`,"Removing item", ()=> {
    const newOrder = this.finalReport.orders.filter(function( orders ) {
      return orders.ItemName !== itemName;
    });
    this.finalReport.orders = newOrder;
    this.saveReportAsDraft();
    this.presentToast(`${itemName} was removed from your final report!`);

   })
  }


  async getCurrentLocation(){
    // let originLatlng = await this.locationService.getCurrentPosition();
    // let watch = await this.locationService.watchPosition();
    // console.log(watch)
    // this.currentLatLong = originLatlng;
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    return mode === 'ios' ? 'Inbox' : '';
  }
  itemOnOfferChange(
    event: {
      component: IonicSelectableComponent,
      value: any
    }
  ): void{

  }


  async getAllDraftReports(){
    var regex = new RegExp(this.custCode.toLowerCase(), 'g');
    const clientDraftReport = await this.db.draftReport.filter(report => regex.test(report.clientCode.toLowerCase())).toArray();
    if(clientDraftReport.length > 0){
      this.finalReport = clientDraftReport[0]?.report;
      this.presentToast(`We found ${clientDraftReport.length} saved report for ${this.clientDetails[0]?.CustName}`);
    }
  }

  async presentActionSheet() {
    const self = this;
    const actionSheet = await this.actionSheetController.create({
      header: 'MORE OPTIONS',
      cssClass: 'my-custom-class',
      mode:'ios',
      buttons: [
        {
          text: 'Map This Client',
          icon: 'location-outline',
          handler: () => {
            // self.saveReportAsDraft();
            self.mapClient();
          }
        }, 
        // {
        // text: 'Save Report as Draft',
        // icon: 'save-outline',
        // handler: () => {
        //   self.saveReportAsDraft();
        // }
        // }, 
        {
          text: 'Remove Report From Draft',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            self.deleteReportFromDraft(self.clientDetails[0]?.CustCode, self.clientDetails[0]?.CustName);
          }
        },
       {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    // console.log('onDidDismiss resolved with role', role);
  }

  async mapClient(){
    const modal = await this.modalController.create({
      component: MapOutletPage,
      cssClass: 'my-custom-class',
      mode: 'ios',
      componentProps: {
        clientName: this.clientDetails[0]?.CustName,
        custCode: this.custCode,
        currentMapLatlong: this.clientDetails[0]?.latlong
      }

    });

    return await modal.present();
  }

  deleteReportFromDraft(CustCode, CustName){
    const self = this;
    this.dialogServices.confirm(`Did you mean to remove ${CustName} from your draft reports?`, `Removing client from draft reports!`, function(){
      self.db.draftReport.where({clientCode: CustCode}).delete()
      .then(function (deleted) {
        if(deleted){
          self.presentToast(`${CustName} was removed from your draft reports!`);
        }
      });
    });
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      mode: 'ios',
      cssClass: 'toast'
    });
    toast.present();
  }

  goToSlide(index) {
    this.slides.slideTo(index, 500);
  }

  async saveReportAsDraft(){
    const self = this;

    await this.db.transaction('rw', this.db.draftReport, async function () {
      // Populate a Draft report
     this.db.draftReport.put({
        clientCode: self.custCode,
        clientName: self.clientDetails[0]?.CustName,
        date: new Date().toLocaleDateString(),
        report: self.finalReport,
        status: 'Awaiting'
      });

    });
  }

    async presentModal() {
      // console.log(this.otherCustomerference.value);
      const modal = await this.modalController.create({
        component: FinalReportPage,
        cssClass: 'my-custom-class',
        mode: 'ios',
        componentProps: {
          finalReport: this.finalReport,
          custCode: this.custCode,
          clientDetails: {
            details: this.clientDetails[0],
            otherReference: this.otherCustomerference.value
          },
          isUserInRadius: this.isUserInRadius
        }

      });

      return await modal.present();
    }


    addStockToFinalReport(): void{
      const frm = document.querySelector('#frmStock') as HTMLFormElement;
      const fd = new FormData(frm);
      if (this.formValidation(fd)){
        let selectedItem =  {};
        selectedItem['ItemName'] = this.currentlySelectedItem;
        selectedItem['ItemId'] = this.currentlySelectedItemId;
        for (const key of fd.keys()) {
          if(fd.get(key).toString().length > 0){
            selectedItem[key]  = fd.get(key).toString();
          }
          else{
            delete this.finalReport.stock[key];
          }
        }
        this.finalReport.stock.push(selectedItem);
        const uniqueStocks = [...new Map(this.finalReport.stock.map(item => [item.ItemName, item])).values()]; // Remove duplicates stocks
        this.finalReport.stock = uniqueStocks;
        this.presentToast('Stocks added to final report successfully!');
        frm.reset();
        this.saveReportAsDraft();
      }
    }


    addOffersToFinalReport(): void{
      const frm = document.querySelector('#frmOffers') as HTMLFormElement;
      const fd = new FormData(frm);
      if (this.formValidation(fd)){
        const nextKey = Math.floor((Math.random() * 100) + 1);
        this.finalReport.offers[nextKey] = {
          price: fd.get('offerPrice'),
          items: this.itemOnOffer.map((item) => item.ItemName ),
          offerDetails: fd.get('offerDetails'),
          endDate: fd.get('endDate')
        };
        this.presentToast('Promotion/Offers added to final report successfully!');
      }
      frm.reset();
      this.saveReportAsDraft();
    }

    addReturnsOfGoodsToFinalReport(): void{
      const frm = document.querySelector('#frmReturns') as HTMLFormElement;
      const fd = new FormData(frm);
      const singleReturn = {};
      singleReturn['ItemName'] = this.currentlySelectedItem;
      singleReturn['ItemId'] = this.currentlySelectedItemId;
      if (this.formValidation(fd)){

        for (const key of fd.keys()) {
          if(key === 'expiryDate'){
            singleReturn[key] = new Date(fd.get(key).toString()).toLocaleDateString();

          }
          singleReturn[key] = fd.get(key);
        }

        this.finalReport.returns.push(singleReturn);
        // Removing duplicates returns
        const uniqueReturns = [
          ...new Map(this.finalReport.returns.map(
          item => [item.ItemName, item]
          )).values()
        ];
        this.finalReport.returns = uniqueReturns;
        this.presentToast('Returns of goods added to final report successfully!');
      }

      frm.reset();
      this.saveReportAsDraft();
    }

    addOrdersToFinalReport(): void {
      const frm = document.querySelector('#frmOrder') as HTMLFormElement;
      const fd = new FormData(frm);
      let singleOrder = {};
      singleOrder['ItemName'] = this.currentlySelectedItem;
      singleOrder['ItemId'] = this.currentlySelectedItemId;
      if (this.formValidation(fd)){
        for (const key of fd.keys()) {
          if (fd.get(key).toString().length > 0){
            singleOrder[key]  = fd.get(key).toString();
            singleOrder['DeliveryCode'] = this.currentlySelectedDeliveryCode;
            if (this.formValidation(fd)){
              for (const key of fd.keys()) {
                if (fd.get(key).toString().length > 0){
                  singleOrder[key]  = fd.get(key).toString().replace(',','');

                } else {
                  delete this.finalReport.orders[key];
                }
              }
              this.finalReport.orders.push(singleOrder);
              // Removing duplicates orders
              const uniqueOrders = [
                ...new Map(this.finalReport.orders.map(
                  item => [item.ItemName, item]
                )).values()
              ];
              this.finalReport.orders = uniqueOrders;
              this.presentToast('Orders added to final report successfully!');
            }
      frm.reset();
      this.saveReportAsDraft();
    }
  }
  }
  }
    addPaymentToFinalReport(): void{
      const frm = document.querySelector('#frmPayment') as HTMLFormElement;
      const fd = new FormData(frm);
      if (this.formValidation(fd)){

        this.finalReport.payment['proofOfPayment'] = this.pictureB64;
        for (const key of fd.keys()) {
          if (fd.get(key).toString().length > 0){
            this.finalReport.payment[key] = fd.get(key);
          }
        }
        this.presentToast('Payment added to final report successfully!');
      }
      frm.reset();
      this.saveReportAsDraft();
    }

    addCommentToFinalReport(): void{
      const frm = document.querySelector('#frmComment') as HTMLFormElement;
      const fd = new FormData(frm);
      if (this.formValidation(fd)){
        this.finalReport.comments['photo'] = this.commentImageB64;
        this.finalReport.comments['comment'] = fd.get('comment').toString();
        this.presentToast('Comment added to final report successfully!');
        frm.reset();
        this.saveReportAsDraft();
      }
    }


    formValidation(fd): boolean{
      for (const key of fd.keys()) {
        if (fd.get(key).toString().length < 1){
          this.presentAlert(`${key} is required`, 'Empty field detected!');
          return false;
        }
      }

      return true;
    }


  getClientDetails(): void {
    this.subscription.add(
      this.clientService.getClientDetails(this.custCode)
      .subscribe((data: IClientDetails[]) => {
        this.clientDetails = data;
        this. getDistanceMatrix();
        this.isLoading = false;
        this.getAllDraftReports();
      })
    );
  }

  async alertUser(msg){
    const alert = await this.alertController.create({
      header: 'Info',
      message: msg,
      buttons: [
        {
          text: 'ok',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
             return false;
          }
        }
      ]
    });
    await alert.present();
  }

  // Refreshing page
  doRefresh(event) {
    // Begin async operation
    this.getClientDetails(); // refetch  order details
    this.getDistanceMatrix();
    setTimeout(() => {
      // Async operation has ended
      event.target.complete();
    }, 2000);
  }


  getItemGroup(): void{
    this.subscription.add(
      this.productService.getItemGroups()
      .subscribe((itemGroups: IItemGroup[]) => {
        // console.log(itemGroups);
        this.itemGroups = itemGroups;
      })
    );
  }

  getDeliveryCode(): void{
    this.subscription.add(
      this.clientService.getDeliveryCode(this.custCode).subscribe(deliveryDetails => {
        this.deliveryDetails = deliveryDetails;
      })
    );
  }

  itemGroupChange(
    event: {
      component: IonicSelectableComponent,
      value: any
    }
  ): void{
    this.currentlySelectedItemGroup = event.value?.ItemGroup;
    this.getItems(event.value?.ItemGroup);
  }

  itemDeliveryCodeChange( event: {
    component: IonicSelectableComponent,
    value: any
  }): void{
    this.currentlySelectedDeliveryCode= event.value?.DelAddrCode
  }

  getItems(itemGroup: string): void{
    this.subscription.add(
      this.productService.getProducts(itemGroup, this.custCode)
      .subscribe((products: IProduct[]) => {
        // console.log(products);
        this.products = products;
       })
   );

  }

  getSearchedItem(hint): void{
    try{
    this.subscription.add(
      this.productService.getSearchedItem(hint, this.custCode)
      .subscribe((products: IProduct[]) => {
        // console.log(products);
        this.products = products;
       })
    );
    this.currentlySelectedItem = this.product?.ItemName;
    this.currentlySelectedItemId = this.product?.ItemId;
    this.currentlySelectedSalesPriceExcl = this.product?.SalePriceExcl;
      }catch (err){
          //
      }
  }


  itemsChange(
    event: {
      component: IonicSelectableComponent,
      value: any
    }
  ): void{
      this.currentlySelectedItem = this.product?.ItemName;
      this.currentlySelectedItemId = this.product?.ItemId;
      this.currentlySelectedSalesPriceExcl = this.product?.SalePriceExcl;
  }
  onInput(event): void{
    this.getSearchedItem(event.text);
  }

  commentSrc :SafeResourceUrl = 'https://via.placeholder.com/600x200';
  commentImageB64: any;
  async takePicture(action){

    switch(action){ 
      case 'payment': 
          await Camera.getPhoto({
            quality: 80,
            allowEditing: true,
            resultType: CameraResultType.Base64
          })
          .then(CameraPhoto => {
            this.src = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${CameraPhoto.base64String}`);
            this.pictureB64 = CameraPhoto.base64String;
          });
      break;
      case 'comment':
        await Camera.getPhoto({
          quality: 80,
          allowEditing: true,
          resultType: CameraResultType.Base64
        })
        .then(CameraPhoto => {
          this.commentSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${CameraPhoto.base64String}`);
          this.commentImageB64 = CameraPhoto.base64String;
        });
        break;


    }
  };


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

  scheduledVisits: any = [];
  checkScheduledVisits(){
    this.scheduledVisits = [];
    const today = new Date().toLocaleDateString('zh-Hans-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    this.subscription.add(
      this.assignedVisitsService.checkScheduledVisits(this.custCode, this.currentUser.userCode, today).subscribe((visits)=> {
        this.scheduledVisits = visits.filter(visit => visit?.CustCode === this.custCode);// checking if user is assigned to this outlet
        if(this.scheduledVisits.length === 0){
          this.scheduledVisits = visits;// if the user is not assigned to this outlet today, then we consider using the point_of_inetrest
        }
      })
    );

  }

  isUserInRadius: boolean = false;

  userDistanceMatrix: any = [];
   getDistanceMatrix(){
    // this.isLoading = true;


    this.checkScheduledVisits();
    // this.db.currentLocation.toCollection().last().then((latestCoordinates)=> {
    //   console.log(latestCoordinates.gps);
    // })

    this.db.currentLocation.toCollection().last().then((latestCoordinates)=> {
      let destinationLatlng = (this.scheduledVisits[0] && this.scheduledVisits[0]?.google_place_id)? `place_id:${this.scheduledVisits[0]?.google_place_id}`: this.clientDetails[0]?.latlong;
      
        this.googleMapService.getDistanceMatrix(latestCoordinates.gps, destinationLatlng).subscribe((response)=> {
          // console.log(latestCoordinates.gps)
          // console.log(destinationLatlng);
          this.userDistanceMatrix = response;
          this.isUserInRadius = ((this.userDistanceMatrix?.distance && !this.userDistanceMatrix?.distance?.text.includes("km"))? true: (this.scheduledVisits[0]?.Geofence > this.userDistanceMatrix?.distance?.value));
        });
      });

      //If the user was assigned by outlet get the latlng, if the user was assigned by point_of_interest get the google_place_id  

      // console.log(this.userDistanceMatrix?.distance?.text);

  }

  currentStockExpiryDate = new FormControl(this.today);
  returnExpiryDate = new FormControl(this.today);
  paymentDate = new FormControl(this.today);
  promotionDate = new FormControl(this.today);

  dateChanged(event, formInput){
    const expiryDate = format(new Date(event.target.value), 'yyyy-MM-dd')
    this[`${formInput}`].setValue(expiryDate);
  }

}
