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
    this.authService.getUserInfo().then( result => {
        this.currentUser = result;
        console.log("In Init of Home Page: >>>", this.authService.authenticated);
        console.log("In Init of Home Page: >>>", this.currentUser);
   },
   error => {
      console.log("ERROR: >>> ", error);
   });

  }

}
