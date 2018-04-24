import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MyAuthService } from '../../services/auth.service';
import { HbuddyService } from '../../services/hbuddy.service';

@Component({
  selector: 'app-h-buddy',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.css']
})
export class PlacesComponent implements OnInit {

  currentUser: any;
  places: any;
  selectedPlace: any;
  placeAreas: any;

  constructor(private router: Router, private authService: MyAuthService, private hBuddyService: HbuddyService,) {

  }

  ngOnInit() {
    console.log("IN Places Page: >>> ");
    if(this.authService.authenticated){
          this.authService.getUserInfo().then( result => {
              this.currentUser = result;
              console.log("In Init of Places Page: >>>", this.authService.authenticated);
              console.log("In Init of Places Page: >>>", this.currentUser);
              if(!this.currentUser || (!this.currentUser.id && !this.currentUser.uid)){
                this.router.navigate(['/']);
                return false;
              }
              this.fetchPlaces();
         },
         error => {
            console.log("ERROR: >>> ", error);
            this.router.navigate(['/']);
         });
   }else{
     this.router.navigate(['/']);
   }

  }

  fetchPlaces(){

    this.hBuddyService.fetchUserPlaces(this.currentUser).then( result => {
        this.places = result;
        console.log("Response of fetchPlaces: >>> ", this.places);
        if(this.places && this.places.length == 1){
          this.selectedPlace = this.places[0];
          console.log("SelectedPlace: >>> ", this.selectedPlace);
          this.fetchPlaceAreas();
        }
   },
   error => {
      console.log("ERROR: >>> ", error);
   });
  }

  fetchPlaceAreas(){
    if(!this.selectedPlace){
      return false;
    }
    console.log("IN fetchPlaceAreas for :>>>> ", this.selectedPlace);
    this.hBuddyService.fetchPlaceAreas(this.selectedPlace).then( result => {
        this.placeAreas = result;
        console.log("Response of fetchPlaceAreas: >>> ", this.placeAreas);
   },
   error => {
      console.log("ERROR: >>> ", error);
   });
  }


}
