import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
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

  constructor(private router: Router, public sharedService: SharedService, private hBuddyService: HbuddyService,) {

  }

  ngOnInit() {
    this.currentUser = this.sharedService.getCurrentUser();
    console.log("ngOnInit Places, this.currentUser: >> ", this.currentUser);
    if(!this.currentUser || (!this.currentUser.id && !this.currentUser.uid)){
      this.router.navigate(['/', {"action": "login"}]);
      return false;
    }
    this.fetchPlaces();
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
