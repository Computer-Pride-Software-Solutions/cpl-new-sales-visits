import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
      },
      {
        path: 'tab3',
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
      },
      {
        path: 'tab4',
        loadChildren: () => import('../tab4/tab4.module').then(m => m.Tab4PageModule)
      },
   
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
    canActivate: [AuthGuardService]
  },
  {
    path: 'tabs/tab2/client-details/:custCode',
    loadChildren: () => import('../tab2/client-details/client-details.module').then( m => m.ClientDetailsPageModule),
    canActivate: [AuthGuardService]

  },
  {
    path: 'tabs/tab4/product-details/:itemGroup/:itemCode/:pricelistId',
    loadChildren: () => import('../tab4/product-details/product-details.module').then( m => m.ProductDetailsPageModule),
    canActivate: [AuthGuardService]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
