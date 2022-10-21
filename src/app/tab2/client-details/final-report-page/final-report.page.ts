import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FinalReportService } from 'src/app/services/FinalReport/final-report.service';
// import { FirebaseService } from 'src/app/services/firebase/firebase.service';
import { DexieService } from 'src/app/services/Database/Dexie/dexie.service';
import { DialogService } from 'src/app/services/Dialog/dialog.service';
import { LocationService } from 'src/app/services/Location/location.service';
// import { PdfmakeService } from 'src/app/services/pdfmake/pdfmake.service';

@Component({
  selector: 'app-final-report',
  templateUrl: './final-report.page.html',
  styleUrls: ['./final-report.page.scss'],
})
export class FinalReportPage implements OnInit, OnDestroy {
  // faFileInvoice = faFileInvoice;
  isLoading = false;

  subscription: Subscription = new Subscription();
  // custCode = this.activatedRoute.snapshot.paramMap.get('custCode');
  // salesRep = JSON.parse(localStorage.getItem('currentUser')).username;
  // location: Promise<any>;
  slideOpts = {
    initialSlide: 1,
    speed: 400
  };
  totalOrders = 0;

  salesType = 'Sales Order';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  @Input() finalReport: any;
  @Input() clientDetails: any; 
  @Input() isUserInRadius: boolean;
  
  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private finalReportService: FinalReportService,
    private router: Router,
    private db: DexieService,
    private locationService: LocationService,
    private dialogService: DialogService,
    // private printService: PdfmakeService
    ) {

     }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.calculateTotalOrderPrice();
  }

  setSalesType(salesType){
    this.salesType = salesType;
  }

  calculateTotalOrderPrice(): void{
    for (let i = 0; i < this.finalReport.orders.length; i++){
      this.totalOrders += this.finalReport.orders[i].QTY * this.finalReport.orders[i].price;
    }
  }

  dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  submitFinalReport(){
    const self = this;
    this.dialogService.confirmDialog('Submit Final Report!','Confirm that you meant to submit this report.', async function(){
      self.isLoading = true;
      let originLatlng = await self.locationService.getCurrentPosition();
      if(originLatlng === undefined || originLatlng === null){
        self.presentAlert("We are unable to capture your current location!", "Your Mobile GPS is OFF")
        return false;
      }

      self.subscription.add(   
        self.finalReportService.submitFinalReport(
          {
            finalReport: self.finalReport,
            gps: originLatlng,
            salesRep: self.currentUser.username,
            salesType: self.salesType,
            otherReference: self.clientDetails?.otherReference
          },
          self.clientDetails.details?.CustCode
        ).subscribe( rsp => {
          self.presentAlert(rsp['msg'], rsp['status']);
          // this.removeReportFromDraft(this.clientDetails?.CustCode);
          self.updateReportStatus(self.clientDetails?.details.CustCode, 'Sent');
          self.isLoading = false;
        })
      );
    
    })

  }

  async updateReportStatus(clientCode: string, status: string){
    await this.db.transaction('rw', this.db.draftReport, function () {
      this.db.draftReport.where("clientCode").equals(clientCode).modify({status: status});
    });
  }

  async removeReportFromDraft(clientCode: string){
    await this.db.transaction('rw', this.db.draftReport, function () {
      this.db.draftReport.delete(clientCode);
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
    this.finalReport = {
      stock : [],
      POS: {},
      returns: [],
      orders: [],
      payment: {},
      comments: ''
    };
    this.dismissModal();
    this.router.navigate(['/tabs/tab2']);

  }

  // printOrder(){
  //   this.printService.printSalesOrder();
  // }


}
