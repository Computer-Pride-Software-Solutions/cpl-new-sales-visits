import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinalReportPagePageRoutingModule } from './final-report-routing.module';

import { FinalReportPage } from './final-report.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinalReportPagePageRoutingModule
  ],
  declarations: [FinalReportPage]
})
export class FinalReportPagePageModule {}
