import { Component, OnInit } from '@angular/core';
import { MyAuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  currentUser: any;

  constructor(private authService: MyAuthService) {

  }

  ngOnInit() {
    if(this.authService.authenticated){
      this.authService.getUserInfo().then( result => {
          this.currentUser = result;
          console.log("In Init of Home Page: User is Authenticated >>>");
     },
     error => {
        console.log("ERROR: >>> ", error);
     });
   }else{
     console.log("USER IS NOT loggedIn !!! ");
   }
  }

}
