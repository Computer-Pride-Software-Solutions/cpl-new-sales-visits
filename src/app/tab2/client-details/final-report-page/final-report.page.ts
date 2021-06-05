import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FinalReportService } from 'src/app/services/FinalReport/final-report.service';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';
import { DexieService } from 'src/app/services/Database/Dexie/dexie.service';

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
  salesRep = JSON.parse(localStorage.getItem('currentUser')).username;
  // location: Promise<any>;
  
  totalOrders = 0;
  @Input() finalReport: any;
  @Input() clientDetails: any; 
  @Input() isUserInRadius: boolean;
  
  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private finalReportService: FinalReportService,
    private router: Router,
    private firebaseService: FirebaseService,
    private db: DexieService,
    ) {

     }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.getCurrentLocation();
    this.calculateTotalOrderPrice();

    // console.log(this.checkRadius());
  }

  currentGPS: string = '';
  async getCurrentLocation(){
    const currentLocation = await this.db.currentLocation.orderBy('id').last();
    this.currentGPS = currentLocation.gps;

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

  async submitFinalReport(): Promise<any>{

    this.isLoading = true;

    if (Object.keys(this.finalReport.payment).length > 0){
      let url = await this.firebaseService.uploadImageToFirebase('payments',this.finalReport.payment.proofOfPayment)
      this.finalReport.payment.proofOfPayment = url;
      // console.log(url);
    }

 
      this.subscription.add(   
        this.finalReportService.submitFinalReport(this.finalReport, this.currentGPS, this.clientDetails?.CustCode, this.salesRep).subscribe( rsp => {
          this.presentAlert(rsp['msg'], rsp['status']);
          this.isLoading = false;
        })
      );
    

  }






  async confirmSubmission() {
    const self = this;
    const alert = await this.alertController.create({
      header: `Submit Final Report!`,
      message: `Confirm that you meant to submit this report.`,
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            return false;
          }
        }, {
          text: 'Confirm',
          handler: () => {
            self.submitFinalReport();
          }
        }
      ]
    });

    await alert.present();
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


}
