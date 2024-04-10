import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { IonicSelectableModule } from 'ionic-selectable';

import { FinalReportPagePageRoutingModule } from './final-report-routing.module';

import { FinalReportPage } from './final-report.page';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IonicSelectableModule,
    FinalReportPagePageRoutingModule
  ],
  providers: [
    FirebaseService
  ],
  declarations: [FinalReportPage]
})
export class FinalReportPagePageModule {}
