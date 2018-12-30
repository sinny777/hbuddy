import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewChild, ElementRef } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  authForm: FormGroup;
  CONFIG: any;

  @ViewChild('closeBtn1') closeBtn: ElementRef;
  constructor(private fb: FormBuilder, private http: Http) {
    this.CONFIG = environment;
    this.authForm = fb.group({
      'username' : [null, Validators.required],
      'password' : [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
      'validate' : ''
    });

   }

  ngOnInit() {
      // your other code
    setTimeout(() => {
       // document.getElementById("authModalLink").click();
      // document.getElementById("loginModalLink").click();
    }, 200);
  }

  onSubmit() {
    if (this.authForm.valid) {
      console.log("Form Submitted!", this.authForm.value);
      this.http.post(this.CONFIG.socket.baseUrl+'/login', this.authForm.value)
      .toPromise()
      .then(this.extractData)
            .catch(this.handleErrorPromise);
      this.authForm.reset();
    }
  }

  private extractData(res: any) {
        let body = res.json();
        return body;
  }

  private handleErrorPromise (error: Response | any) {
      console.error(error.message || error);
       return Promise.reject(error.message || error);
  }

  // onSubmit() {
  //   this.http.post('https://hukamtechnologies.localtunnel.me/login', JSON.stringify(this.authForm))
  //       .subscribe(...);
  // }

}
