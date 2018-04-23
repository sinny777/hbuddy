import { Router } from '@angular/router';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from "angular2-social-login";
import { MyAuthService } from './services/auth.service';
import { SharedService } from './services/shared.service';
import { HbuddyService } from './services/hbuddy.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  sub: any;
  currentUser: any;
  loginForm: FormGroup;
  post:any;
  CONFIG: any;

  @ViewChild('closeBtn') closeBtn: ElementRef;

  constructor(private router: Router, public _auth: AuthService, private myAuthService: MyAuthService, public sharedService: SharedService, private hBuddyService: HbuddyService, private fb: FormBuilder){
        this.CONFIG = environment;
        console.log("CONFIG: >>> ", this.CONFIG);
        this.myAuthService.getUserInfo().then( result => {
            this.currentUser = result;
            // console.log("In Init of AppComponent: >>>", this.myAuthService.authenticated);
            // console.log("In Init of AppComponent: >>>", this.currentUser);
       },
       error => {
          console.log("ERROR: >>> ", error);
       });
      this.loginForm = fb.group({
        'username' : [null, Validators.required],
        'password' : [null, Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(20)])],
        'validate' : ''
      });
   }

   gotoRegister(){
     console.log("IN gotoRegister: >>> ");
   }

  signIn(provider){
    console.log("Sign In to: >>> ", provider);
    this.sub = this._auth.login(provider).subscribe(
      (data) => {
                  console.log(data);
                  this.currentUser = data;
                  this.sharedService.setCurrentUser(this.currentUser);
                  this.closeBtn.nativeElement.click();
                }
    );
  }

  handleLogin(post){
    // console.log("IN handleLogin: >>> ", JSON.stringify(post));
    let loginReq = {
      "params": {
        "email": post.username,
        "password": post.password
      }
    }
    this.myAuthService.login(loginReq).then( result => {
        // console.log("Response of LOGIN: >>> ", result);
        this.currentUser = result;
        this.closeBtn.nativeElement.click();
   },
   error => {
      console.log("ERROR: >>> ", error);
   });
  }

  logout(){
    this._auth.logout().subscribe(
      (data)=>{
        this.currentUser = null;
      }
    );
    this.myAuthService.logout();
    this.router.navigate(['/', {"action": "login"}]);
  }

}
