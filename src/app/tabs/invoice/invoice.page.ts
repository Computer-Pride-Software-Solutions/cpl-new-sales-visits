import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// import {format} from 'date-fns';
import { Subscription } from 'rxjs';
import { VisitService } from 'src/app/services/visit/visit.service';
import { debounceTime } from 'rxjs/operators';
import { PdfmakeService } from 'src/app/services/pdfmake/pdfmake.service';
import { CompanyDetailsService } from 'src/app/services/company/company-details.service';
import { CustomerService } from 'src/app/services/customer/customer.service';

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
  });

  client = new FormControl('', [Validators.minLength(3), Validators.min(3)]);


  visits:any[] = [];
  visitOrders:any[] = [];

  constructor(
    public modalController: ModalController,
    public visitServive: VisitService,
    private printService: PdfmakeService,
    private companyService: CompanyDetailsService,
    private customerService: CustomerService



    ) { }
  ngAfterViewInit(): void {
    this.searchVisits();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.getVisits();
    this.getCompanyDetails();
  }

  dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    });
  }


  dateRangeChanged(){
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

  loading = false;
  async printOrder(VSTNo){
    this.loading = true;
    const selectedVisit = this.visits.find((visit)=> visit.VSTNo === VSTNo)
    const customer = await this.customerService.getCustomer(selectedVisit.CustId);
    await this.printService.printSalesOrder({orders: this.visitOrders, visitInfo: selectedVisit, companyDetails: this.companyService.getCompanyDetails(), customer: customer});
    this.loading = false;
    // console.log(customer)
  }
  
  async getCompanyDetails(){
    const company =  await this.companyService.getCompanyDetails();
    return company;
  }

  // async getCustomer(customerId){
  //   return await this.customerService.getCustomer(customerId);
  // }
 
}
