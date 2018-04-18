import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class MyAuthService {

  private headers: Headers;
  private reqOptions: RequestOptions;

  userProfile: any;
  accessToken: string;

  // Create a stream of logged in status to communicate throughout app
  loggedIn: boolean;
  loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);

  constructor(private http: Http) {
    // You can restore an unexpired authentication session on init
    // by using the checkSession() endpoint from auth0.js:
    // https://auth0.com/docs/libraries/auth0js/v9#using-checksession-to-acquire-new-tokens
  }

  private refreshHeaders(){
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Accept', 'application/json');
    this.headers.append("X-IBM-Client-Id", "default");
    this.headers.append("X-IBM-Client-Secret", "SECRET");

    if(this.accessToken){
      this.headers.append("Authorization", this.accessToken);
    }
  }

  private _setLoggedIn(value: boolean) {
    // Update login status subject
    this.loggedIn$.next(value);
    this.loggedIn = value;
  }

  login(payload): Promise<any>{
    let POST_URL: string = environment.API_BASE_URL + "/MyUsers/login?include=user";
    if(!payload || !payload.params){
        return Promise.reject("INVALID DATA");
    }else{
        this.reqOptions = new RequestOptions({headers: this.headers});
        var that = this;
        return this.http.post(POST_URL, payload.params, this.reqOptions)
        .toPromise()
        .then(function(resp){
          var profile = resp.json();
          var authResult = {"userId": profile.userId, "accessToken": profile.id};
          that._setSession(authResult, profile);
          that.refreshHeaders();
          return profile;
        }).catch(this.handleErrorPromise);
    }
  }

  getUserInfo(authResult) {
    let GET_URL: string = environment.API_BASE_URL + "/MyUsers";
    if(!authResult || !authResult.userId){
        return Promise.reject("INVALID DATA TO FETCH USER");
    }else{
        let findReq: any = {filter: {where: {userId: authResult.userId}}};
        this.reqOptions = new RequestOptions({headers: this.headers});
        this.reqOptions.params = findReq;
        var that = this;
        return this.http.get(GET_URL, this.reqOptions)
        .toPromise()
        .then(function(resp){
          var profile = resp.json();
          that._setSession(authResult, profile);
          return profile;
        }).catch(this.handleErrorPromise);
    }

  }

  private _setSession(authResult, profile) {
    const expTime = authResult.expiresIn * 1000 + Date.now();
    // Save session data and update login status subject
    localStorage.setItem('expires_at', JSON.stringify(expTime));
    localStorage.setItem("userId", authResult.userId);
    localStorage.setItem("accessToken", authResult.accessToken);
    this.accessToken = authResult.accessToken;
    this.userProfile = profile;
    this._setLoggedIn(true);
  }

  logout() {
    // Remove token and profile and update login status subject
    localStorage.removeItem('expires_at');
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    this.accessToken = undefined;
    this.userProfile = undefined;
    this._setLoggedIn(false);
  }

  get authenticated(): boolean {
    // Check if current date is greater than expiration
    // and user is currently logged in
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));

    const isLoggedIn = (Date.now() < expiresAt) && this.loggedIn;
    if(!this.loggedIn && (Date.now() < expiresAt)) {
      const userId = localStorage.getItem('userId');
      this.accessToken = localStorage.getItem('accessToken');
      if(userId){
        this.refreshHeaders();
        console.log("accessToken: >> ", this.accessToken);
        this.getUserInfo({"userId": userId, "accessToken": this.accessToken}).then( result => {
            console.log("Response of getUserInfo: >>> ", result);
       },
       error => {
          console.log("ERROR: >>> ", error);
       });
      }
    }    

    return (Date.now() < expiresAt) && this.loggedIn;
  }

  private extractData(res: Response) {
        let body = res.json();
        return body;
  }

  private handleErrorPromise (error: Response | any) {
      console.error(error.message || error);
       return Promise.reject(error.message || error);
  }

}
