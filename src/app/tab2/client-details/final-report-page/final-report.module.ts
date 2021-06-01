import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinalReportPagePageRoutingModule } from './final-report-routing.module';

import { FinalReportPage } from './final-report.page';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinalReportPagePageRoutingModule
  ],
  providers: [
    FirebaseService
  ],
  declarations: [FinalReportPage]
})
export class FinalReportPagePageModule {}
