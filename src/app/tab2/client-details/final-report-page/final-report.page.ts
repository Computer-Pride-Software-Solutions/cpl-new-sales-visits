import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
// import { faFileInvoice} from '@fortawesome/free-solid-svg-icons';
// import { FinalReportService } from '../../services/final-report/final-report.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LocationService } from 'src/app/services/location/location.service';
import { Geolocation} from '@ionic-native/geolocation/ngx';
import { FinalReportService } from 'src/app/services/FinalReport/final-report.service';

@Component({
  selector: 'app-final-report',
  templateUrl: './final-report.page.html',
  styleUrls: ['./final-report.page.scss'],
})
export class FinalReportPage implements OnInit, OnDestroy {
  // faFileInvoice = faFileInvoice;
  isLoading = this.locationService.isLoading;

  subscription: Subscription = new Subscription();
  // custCode = this.activatedRoute.snapshot.paramMap.get('custCode');
  salesRep = JSON.parse(localStorage.getItem('currentUser')).username;
  location: Promise<any>;

  totalOrders = 0;
  @Input() finalReport: any;
  @Input() custCode: any;
  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private finalReportService: FinalReportService,
    private router: Router,
    private locationService: LocationService
    ) {

     }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.calculateTotalOrderPrice();
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

  submitFinalReport(): void{
    this.isLoading = true;
    if(this.locationService.currenGPS === undefined || this.locationService.currenGPS === null){
      this.locationService.getCurrentPosition().then(gps => {
        this.subscription.add(   
          this.finalReportService.submitFinalReport(this.finalReport, gps, this.custCode, this.salesRep).subscribe( rsp => {
            this.presentAlert(rsp['msg'], rsp['status']);
            this.isLoading = false;
          })
        );
    });
    }else{
      this.subscription.add(   
        this.finalReportService.submitFinalReport(this.finalReport, this.locationService.currenGPS, this.custCode, this.salesRep).subscribe( rsp => {
          this.presentAlert(rsp['msg'], rsp['status']);
          this.isLoading = false;
        })
      );     
    }

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
