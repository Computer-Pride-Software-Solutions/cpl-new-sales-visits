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
import { LocationService } from 'src/app/services/location/location.service';
import { AssignedVisitsService } from 'src/app/services/assigned-visits/assigned-visits.service';
import { GoogleMapsService } from 'src/app/services/google/google-maps.service';
import { IVisits } from 'src/app/interfaces/IVisits';


import { Camera, CameraResultType } from '@capacitor/camera';
import { DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';


@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.page.html',
  styleUrls: ['./client-details.page.scss'],
})
export class ClientDetailsPage implements OnInit, OnDestroy {
  currentLatLong: any;
  today: String = new Date().toISOString();

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


  finalReport = {
    stock : [],
    offers: {},
    returns: [],
    orders: [],
    payment: {},
    comments: ''
  };

  pictureB64: SafeResourceUrl = 'assets/images/sample-cheque.jpeg';
  picture: File = null;
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
    private sanitizer: DomSanitizer
    ) { 
    //  this.locationService.watchPosition();
      this.getCurrentLocation();
    }
    @ViewChild(IonSlides) slides: IonSlides;


  ngOnInit() {
    this.getClientDetails();
    this.getDistanceMatrix();
    this.getAllDraftReports();
    this.getItemGroup();
    this.getDeliveryCode();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async getCurrentLocation(){
    let originLatlng = await this.locationService.getCurrentPosition();
    this.currentLatLong = originLatlng;

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
    // console.log(this.itemOnOffer);
    // const names = this.itemOnOffer.map((item) => item.ItemName );
    // console.log(names);
      // this.currentlySelectedItem = this.product?.ItemName;
      // this.currentlySelectedItemId = this.product?.ItemId;
      // this.currentlySelectedSalesPriceExcl = this.product?.SalePriceExcl;
  }
  // addItemToOffer(){
  //   this.noOfitemOnOffer++;
  // }

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
        {
        text: 'Save Report as Draft',
        icon: 'save-outline',
        handler: () => {
          self.saveReportAsDraft();
        }
        }, 
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
      }

    });

    return await modal.present();
  }

  deleteReportFromDraft(CustCode, CustName){
    const self = this;
    this.db.draftReport.where({clientCode: CustCode}).delete()
    .then(function () {
        self.presentToast(`${CustName} was removed from draft reports!`);
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
        report: self.finalReport
      });

  
      // console.log(report);
    });
  }

  // triggerFile(){
  //   document.getElementById('fileInput').click();
  // }


  // onFileChange(e){
  //   this.picture =  <File>e.target.files[0];

  //   var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
  //   const pattern = /image-*/;
  //   const reader = new FileReader();
  //   if (!file.type.match(pattern)) {
  //     alert('invalid format');
  //     return;
  //   }
  //   reader.onload = this._handleReaderLoaded.bind(this);
  //   reader.readAsDataURL(file);
  // }
  // _handleReaderLoaded(e) {
  //   let reader = e.target;
  //   this.pictureB64 = reader.result;
  //   // console.log(this.picture)
  // }

  // currentLatLong: string;
  // async getCurrentLocation(){
  //   this.currentLatLong = (this.locationService.currenGPS)? await Promise.resolve(this.locationService.currenGPS) : await this.locationService.getCurrentPosition();
  // }

    async presentModal() {
      const modal = await this.modalController.create({
        component: FinalReportPage,
        cssClass: 'my-custom-class',
        mode: 'ios',
        componentProps: {
          finalReport: this.finalReport,
          custCode: this.custCode,
          clientDetails: this.clientDetails[0],
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
        this.finalReport.comments = fd.get('comment').toString();
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
        this.isLoading = false;
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
        this.products = products;
       })
   );

  }

  getSearchedItem(hint): void{
    try{
    this.subscription.add(
      this.productService.getSearchedItem(hint, this.custCode)
      .subscribe((products: IProduct[]) => {
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

  src : SafeResourceUrl;
  async takePicture(){

    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: true,
      resultType: CameraResultType.Base64
    })
    .then(CameraPhoto => {
      this.pictureB64 = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${CameraPhoto.base64String}`);

    })
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
  async getDistanceMatrix(){
    this.isLoading = true;

    this.checkScheduledVisits();
    // let originLatlng = await this.locationService.getCurrentPosition();
    if(this.currentLatLong === undefined || this.currentLatLong === null || this.scheduledVisits.length === 0){
      this.presentAlert("You are most likely not assigned to this client today!", "You can't submit this order")
      return false;
    }
    console.log(this.currentLatLong);

    //If the user was assigned by outlet get the latlng, if the user was assigned by point_of_interest get the google_place_id
    let destinationLatlng = (this.scheduledVisits[0] && this.scheduledVisits[0]?.google_place_id)? `place_id:${this.scheduledVisits[0]?.google_place_id}`: this.clientDetails[0]?.latlong;

    this.googleMapService.getDistanceMatrix(this.currentLatLong, destinationLatlng).subscribe((response)=> {
      this.userDistanceMatrix = response;
      this.isUserInRadius = (this.scheduledVisits[0]?.Geofence > this.userDistanceMatrix?.distance?.value);
      this.isLoading = false;
    });
  }




}
