import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapOutletPage } from './map-outlet.page';

const routes: Routes = [
  {
    path: '',
    component: MapOutletPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapOutletPageRoutingModule {}
