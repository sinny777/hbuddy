import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from "angular2-social-login";
import { SharedService } from './services/shared.service';
import { HbuddyService } from './services/hbuddy.service';

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

  @ViewChild('closeBtn') closeBtn: ElementRef;

  constructor(public _auth: AuthService, public sharedService: SharedService, private hBuddyService: HbuddyService, private fb: FormBuilder){
      this.currentUser = this.sharedService.getCurrentUser();
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
    console.log("IN handleLogin: >>> ", JSON.stringify(post));
    let loginReq = {
      "params": {
        "email": post.username,
        "password": post.password
      }
    }
    this.hBuddyService.login(loginReq).then( result => {
        console.log("Response of LOGIN: >>> ", result);
        this.currentUser = result;
        this.sharedService.setCurrentUser(this.currentUser);
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
  }

}
