import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.page.html',
  styleUrls: ['./invoice.page.scss'],
})
export class InvoicePage implements OnInit {

  today = new Date().toLocaleDateString();
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
}
