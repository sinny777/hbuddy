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
    var that = this;
      this.authService.userAuth.subscribe(function(userData){
        that.currentUser = userData;
        // console.log("IN Home Page user authenticated: >>> ", that.currentUser);
        if(that.currentUser && that.currentUser.id){
          console.log("USER IS loggedIn !!!")
        }else{
          console.log("USER IS NOT loggedIn !!!")
        }
      });
  }

}
