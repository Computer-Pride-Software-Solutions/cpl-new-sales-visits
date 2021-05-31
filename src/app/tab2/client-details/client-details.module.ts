import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientDetailsPageRoutingModule } from './client-details-routing.module';
import { IonicSelectableModule } from 'ionic-selectable';

import { ClientDetailsPage } from './client-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientDetailsPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [ClientDetailsPage]
})
export class ClientDetailsPageModule {}
