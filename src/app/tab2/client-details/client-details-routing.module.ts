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
  },
  {
    path: 'map-outlet',
    loadChildren: () => import('./map-outlet/map-outlet.module').then( m => m.MapOutletPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientDetailsPageRoutingModule {}
