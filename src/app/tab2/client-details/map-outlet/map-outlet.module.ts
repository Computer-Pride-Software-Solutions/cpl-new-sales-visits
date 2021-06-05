import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapOutletPageRoutingModule } from './map-outlet-routing.module';

import { MapOutletPage } from './map-outlet.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapOutletPageRoutingModule
  ],
  declarations: [MapOutletPage]
})
export class MapOutletPageModule {}
