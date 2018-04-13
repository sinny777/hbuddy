import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from "angular2-social-login";
import { SharedService } from './services/shared.service';

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

  constructor(public _auth: AuthService, public sharedService: SharedService, private fb: FormBuilder){
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
  }

  logout(){
    this._auth.logout().subscribe(
      (data)=>{
        this.currentUser = null;
      }
    );
  }

}
