import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {format} from 'date-fns';
@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.page.html',
  styleUrls: ['./invoice.page.scss'],
})
export class InvoicePage implements OnInit {

  today = new Date().toJSON().slice(0,10);
  invoiceFilterForm = new FormGroup({
    fromDate: new FormControl(this.today, Validators.required),
    toDate: new FormControl(this.today, Validators.required),
    client: new FormControl('')
  });

  invoices = [
    {client: "African cotton", clientCode:"ACI", description:"This is an invoice", lines:[{}]},
    {client: "Espace Numerique", clientCode:"EN",description:"This is an invoice", lines:[{}]},
    {client: "Tomash Dev", clientCode:"TDev",description:"This is an invoice", lines:[{}]}
  ]

  constructor(
    public modalController: ModalController,
    ) { }

  ngOnInit() {
  }

  dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    });
  }


  dateRangeChanged(){
    console.log(this.invoiceFilterForm.getRawValue())
  }

  searchClient(hint){
    if(hint.length > 3){
      const filteredInvoice = this.invoices.filter(
        (invoice)=> invoice.client.toLowerCase().includes(hint.toLowerCase())
      );
      this.invoices = [...filteredInvoice];
    }
  }

  printOrder(){
    
  }
 
}
