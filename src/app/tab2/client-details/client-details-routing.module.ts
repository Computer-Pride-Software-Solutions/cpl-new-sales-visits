import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientDetailsPage } from './client-details.page';

const routes: Routes = [
  {
    path: '',
    component: ClientDetailsPage
  },
  {
    path: 'final-report-page',
    loadChildren: () => import('./final-report-page/final-report.module').then( m => m.FinalReportPagePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientDetailsPageRoutingModule {}
