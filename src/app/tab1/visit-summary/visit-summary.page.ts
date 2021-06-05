import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-visit-summary',
  templateUrl: './visit-summary.page.html',
  styleUrls: ['./visit-summary.page.scss'],
})
export class VisitSummaryPage implements OnInit, OnDestroy {

  subscription: Subscription = new Subscription();

  @Input() visitSummary: any;
  @Input() visitHeader: any;
  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() {
    // console.log(this.visitSummary);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

}
