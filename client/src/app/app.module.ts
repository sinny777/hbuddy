import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Angular2SocialLoginModule } from "angular2-social-login";
import { BrowserXhr, HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { AgmCoreModule } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services/google-maps-api-wrapper';
import { MarkerManager } from '@agm/core/services/managers/marker-manager';
import { CookieService } from 'ngx-cookie-service';

import { MyAuthService } from './services/auth.service';
import { MqttService } from './services/mqtt.service';
import { SharedService } from './services/shared.service';
import { HbuddyService } from './services/hbuddy.service';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HBuddyComponent } from './pages/h-buddy/h-buddy.component';
import { PlacesComponent } from './pages/places/places.component';

let providers = {
    "google": {
      "clientId": "874807563899-9kk6gpacomg9t56pqfc4o8n4gn365ppg.apps.googleusercontent.com"
    },
    "linkedin": {
      "clientId": "81ann4egou3i6j"
    },
    "facebook": {
      "clientId": "330079704089458",
      "apiVersion": "v2.9" //like v2.4
    }
  };

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    HBuddyComponent,
    PlacesComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    Angular2SocialLoginModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD3oMSe59cIpUnouvFcWT3oP3iPwsRp5zk'
    })
  ],
  providers: [GoogleMapsAPIWrapper, MarkerManager, CookieService, MyAuthService, MqttService, SharedService, HbuddyService],
  bootstrap: [AppComponent]
})
export class AppModule { }

Angular2SocialLoginModule.loadProvidersScripts(providers);
