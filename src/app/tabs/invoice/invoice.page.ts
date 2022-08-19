import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {format} from 'date-fns';
import { Subscription } from 'rxjs';
import { VisitSummaryService } from 'src/app/services/summary/visit-summary.service';
import { VisitService } from 'src/app/services/visit/visit.service';
import { debounce, debounceTime } from 'rxjs/operators';
import { PdfmakeService } from 'src/app/services/pdfmake/pdfmake.service';
import { ThirdPartyDraggable } from '@fullcalendar/interaction';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.page.html',
  styleUrls: ['./invoice.page.scss'],
})
export class InvoicePage implements OnInit, OnDestroy, AfterViewInit {
  subscription: Subscription = new Subscription();

  today = new Date().toJSON().slice(0,10);
  invoiceFilterForm = new FormGroup({
    fromDate: new FormControl(this.today, Validators.required),
    toDate: new FormControl(this.today, Validators.required),
    // client: new FormControl('')
  });

  client = new FormControl('', [Validators.minLength(3), Validators.min(3)]);


  visits:any[] = [];
  visitOrders:any[] = [];

  constructor(
    public modalController: ModalController,
    public visitServive: VisitService,
    private printService: PdfmakeService


    ) { }
  ngAfterViewInit(): void {
    this.searchVisits();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.getVisits();
    // console.log("Sam");
  }

  dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    });
  }


  dateRangeChanged(){
    // console.log(this.invoiceFilterForm.getRawValue())
    this.getVisits(this.client.value);

  }

  searchVisits(){
    const result = this.client.valueChanges.pipe(debounceTime(600));
    result.subscribe((hint) => this.getVisits(hint.toLowerCase()));
  }

  getVisits(hint = null): void{
    this.subscription.add(
      this.visitServive.getVisits(hint, this.invoiceFilterForm.getRawValue()).subscribe(visits =>{
          this.visits = visits;
      })
    );
  }
  getOrders(event){
    const visitId = event.detail.value;
    if(visitId !== undefined){
      this.subscription.add(
        this.visitServive.getOrders(visitId).subscribe(orders =>{
            this.visitOrders = orders;
        })
      );
    }
    
  }

  printOrder(VSTNo){
    const selectedVisit = this.visits.filter((visit)=> visit.VSTNo === VSTNo)
    this.printService.printSalesOrder({orders: this.visitOrders, visitInfo: selectedVisit});
  }
 
}
