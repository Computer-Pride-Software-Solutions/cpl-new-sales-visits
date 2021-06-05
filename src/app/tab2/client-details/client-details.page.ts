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
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { MapOutletPage } from './map-outlet/map-outlet.page';
import { LocationService } from 'src/app/services/location/location.service';
import { AssignedVisitsService } from 'src/app/services/assigned-visits/assigned-visits.service';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.page.html',
  styleUrls: ['./client-details.page.scss'],
})
export class ClientDetailsPage implements OnInit, OnDestroy {

  clientDetails: IClientDetails[] = [];
  itemGroups: IItemGroup[] = [];
  itemGroup: IItemGroup;

  products: IProduct[] = [];
  product: IProduct;

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

  public POS = [
    { val: 'Category Branding Displayed', isChecked: false },
    { val: 'FSU Displayed', isChecked: false },
    { val: 'Billboard Displayed', isChecked: false }
  ];


  finalReport = {
    stock : [],
    POS: {},
    returns: [],
    orders: [],
    payment: {},
    comments: ''
  };

  pictureB64 = 'assets/images/sample-cheque.jpeg';
  picture: File = null;
  submit = false;
 
  // photo :SafeResourceUrl;
  hide:boolean=false;
  constructor(public actionSheetController: ActionSheetController,
    private activatedRoute: ActivatedRoute,
    private clientService: ClientService,
    private productService: ProductService,
    public alertController: AlertController,
    public modalController: ModalController,
    private toastCtrl: ToastController,
    private db: DexieService,
    private camera: Camera,
    private locationService: LocationService,
    private assignedVisitsService: AssignedVisitsService

    ) { }
    @ViewChild(IonSlides) slides: IonSlides;


  ngOnInit() {
    this.getScheduledVisits();
    this.getAllDraftReports();
    this.getClientDetails();
    this.getItemGroup();
    this.getDeliveryCode();
    this.getCurrentLocation();

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    return mode === 'ios' ? 'Inbox' : '';
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
    .then(function (deleteCount) {
        self.presentToast(`${CustName} was removed from draft reports!`);
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
          isUserInRadius: this.isUserInRadius()
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
      }
    }

    addPOSMaterialToFinalReport(): void{
        const frm = document.querySelector('#frmPOS') as HTMLFormElement;
        const fd = new FormData(frm);
        for (const material of fd.keys()) {
          if(fd.get(material) === 'on'){
            this.finalReport.POS[material] = 'Y';
          }else{
            delete this.finalReport.POS[material];
          }
          this.presentToast('POS added to final report successfully!');
        }
      frm.reset();
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
    }

    addCommentToFinalReport(): void{
      const frm = document.querySelector('#frmComment') as HTMLFormElement;
      const fd = new FormData(frm);
      if (this.formValidation(fd)){
        this.finalReport.comments = fd.get('comment').toString();
        this.presentToast('Comment added to final report successfully!');
        frm.reset();
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
        // console.log(data)
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


 async  takePhoto() {
    // const image = await Plugins.Camera.getPhoto({
    //   quality:100,
    //   allowEditing:false,
    //   resultType:CameraResultType.DataUrl,
    //   source:CameraSource.Camera
    // });
    
    //   this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));

    // const options: CameraOptions = {
    //   quality: 100,
    //   destinationType: this.camera.DestinationType.DATA_URL,
    //   encodingType: this.camera.EncodingType.JPEG,
    //   mediaType: this.camera.MediaType.PICTURE
    // };

    // this.camera.getPicture(options).then((imageData) => {
    //  // imageData is either a base64 encoded string or a file URI
    //  // If it's base64 (DATA_URL):
    //  this.picture = 'data:image/jpeg;base64,' + imageData;
    // }, (err) => {
    //  // Handle error
    //  alert(err);
    // });
    // const selectedFile = document.getElementById('input').files[0];


    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL, // if the app crashes try FILE_URI then convert it Base64 using the logic from the onFileChange() function above
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64 (DATA_URL):
     let base64Image = 'data:image/jpeg;base64,' + imageData;
     this.pictureB64 = base64Image;
    }, (err) => {
     // Handle error
    });
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

  scheduledVisits: any = [];
  getScheduledVisits(){
    // console.log(this.clientDetails[0]);
    const today = new Date().toLocaleDateString('zh-Hans-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    this.subscription.add( //this.currentUser.userCode
      this.assignedVisitsService.getScheduledVisits(this.custCode,this.currentUser?.userCode , today).subscribe((visits)=> {
        this.scheduledVisits = visits;
        // console.log(visits);
      })
    );

  }

  currentGPS: string = '';
  async getCurrentLocation(){
    const currentLocation = await this.db.currentLocation.orderBy('id').last();
    this.currentGPS = currentLocation?.gps;

  }

  distance: any;
  isUserInRadius(): boolean{
    const lat1 = this.currentGPS?.split(",")[0]; 
    const long1 = this.currentGPS?.split(",")[1];
    const lat2 = this.clientDetails[0]?.latlong.split(",")[0];
    const long2 = this.clientDetails[0]?.latlong.split(",")[1];
    this.distance = parseFloat(this.locationService.distance(lat1, lat2, long1, long2)).toFixed(2);
    const geofence = (this.scheduledVisits?.length > 0)? this.scheduledVisits[0]?.Geofence: 0.00;// If the user is assigned to thic client return the assigned geofence
    return geofence > this.distance;
    
  }



}
