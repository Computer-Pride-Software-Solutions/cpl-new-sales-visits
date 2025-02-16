import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab2Page } from './tab2.page';

const routes: Routes = [
  {
    path: '',
    component: Tab2Page,
  },
  {
    path: 'new-client',
    loadChildren: () => import('./new-client/new-client.module').then( m => m.NewClientPageModule)
  },
  // {
  //   path: 'client-details/:custCode',
  //   loadChildren: () => import('./client-details/client-details.module').then( m => m.ClientDetailsPageModule)
  // }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab2PageRoutingModule {}
