import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Geolocation } from '@ionic-native/geolocation/ngx';
// import { AngularFireModule } from '@angular/fire';
// import { AngularFireStorageModule, BUCKET  } from '@angular/fire/storage';
import { environment } from 'src/environments/environment';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    // AngularFireModule.initializeApp(environment.firebase),
    // AngularFireStorageModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }), 
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
     Geolocation,
     FirebaseService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
