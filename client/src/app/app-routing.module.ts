import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HBuddyComponent } from './pages/h-buddy/h-buddy.component';
import { PlacesComponent } from './pages/places/places.component';
import { AuthComponent } from './pages/auth/auth.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '',      component: HomeComponent },
      { path: 'auth',      component: AuthComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'iot/hbuddy', component: HBuddyComponent },
      { path: 'account/places', component: PlacesComponent, canActivate: [AuthGuard] },
      { path: '**', redirectTo: '', pathMatch: 'full'}
    ], {useHash:true})
  ],
  providers: [
    AuthGuard
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
