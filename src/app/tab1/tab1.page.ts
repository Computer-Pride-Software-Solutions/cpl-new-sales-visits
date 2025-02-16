import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { VisitSummaryPage } from './visit-summary/visit-summary.page';
import { VisitSummaryService } from '../services/summary/visit-summary.service';
import { IVisits } from '../interfaces/IVisits';
import { AssignedVisitsService } from '../services/assigned-visits/assigned-visits.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy, AfterViewInit  {

  scheduledVisits: IVisits[] = [];

  subscription: Subscription = new Subscription();
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // references the #calendar in the template
  calendarOptions: CalendarOptions = {
    initialView: 'listWeek',
    events: this.scheduledVisits,
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventClick: this.handleDateClick.bind(this),
  };

  constructor(
    private scheduledService: AssignedVisitsService,
    private router: Router,
    public modalController: ModalController,
    public visitSummaryService: VisitSummaryService,

  ) {

  }
  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.getScheduledVisits(this.currentUser.username);
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async presentModal(header, summary) {
    const modal = await this.modalController.create({
      component: VisitSummaryPage,
      cssClass: 'my-custom-class',
      mode: 'ios',
      componentProps: {
        visitSummary: summary,
        visitHeader: header
      }

    });

    return await modal.present();
  }

    // Refreshing page
    doRefresh(event) {
      // Begin async operation
      this.getScheduledVisits(this.currentUser.username);
      setTimeout(() => {
        // Async operation has ended
        event.target.complete();
      }, 2000);
    }

  getScheduledVisits(salesRep): void{
      this.subscription.add(
        this.scheduledService.getVisits(salesRep)
        .subscribe(visits => {
          this.calendarOptions.events = visits;
        })
      );
  }

  getClientDetails(custCode: string): void{
    this.router.navigate([`./tabs/tab2/client-details/${custCode}`]);
  }

  handleDateClick(arg) {
    const custName = arg.event._def.title;
    const custCode = arg.event._def.publicId;
    if(custCode === undefined || custCode === null){
      return;
    }
    const clickedDate = new Date(arg.event._instance.range.start).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    this.getVisitSummary(custCode, custName, {from: clickedDate, to: clickedDate});
  }

  getVisitSummary(custCode, custName, daterange): void{
    const header = {
      "custName" : custName,
      "daterange": daterange
    }

    this.subscription.add(
      this.visitSummaryService.getVisitsSummary(custCode, daterange).subscribe(summary =>{
        if(Object.keys(summary).length > 0){
          this.presentModal(header, summary);
        }else{

          this.getClientDetails(custCode);
        }
      })

    );
  }


}
