import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinalReportPage } from './final-report.page';

const routes: Routes = [
  {
    path: '',
    component: FinalReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinalReportPagePageRoutingModule {}
