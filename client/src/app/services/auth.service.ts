import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CookieService } from 'ngx-cookie-service';

import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class MyAuthService {

  headers: Headers;
  private reqOptions: RequestOptions;

  userProfile: any;
  accessToken: string;

  // Create a stream of logged in status to communicate throughout app
  loggedIn: boolean;
  loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);

  constructor(private http: Http, private cookieService: CookieService) {
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
    let findReq: any = {"filter": {"include": {"relation": "roles"}}};
    if(!payload || !payload.params){
        return Promise.reject("INVALID DATA");
    }else{
        this.reqOptions = new RequestOptions({headers: this.headers});
        this.reqOptions.params = findReq;
        var that = this;
        return this.http.post(POST_URL, payload.params, this.reqOptions)
        .toPromise()
        .then(function(resp){
          that.userProfile = resp.json();
          that.accessToken = that.userProfile.id;
          var authResult = {"userId": that.userProfile.userId, "accessToken": that.userProfile.id};
          that._setSession(authResult, that.userProfile);
          that.refreshHeaders();
          return that.userProfile;
        }).catch(this.handleErrorPromise);
    }
  }

  getUserInfo(): Promise<any> {
    if(this.userProfile){
      // console.log("In AuthService, userProfile 1 >>> ", this.userProfile);
      return Promise.resolve(this.userProfile);
    }
    var authData = this.getAuthData();
    console.log("AuthData: >>> ", authData);
      if(authData && authData.userId && authData.accessToken){
        this.accessToken = authData.accessToken;
        this.refreshHeaders();
          let GET_URL: string = environment.API_BASE_URL + "/MyUsers/"+authData.userId;
          // let findReq: any = {"filter": {"where": {"id": authData.userId}, "include": {"relation": "identities"}}};
          let findReq: any = {"filter": {"include": {"relation": "roles"}}};
          this.reqOptions = new RequestOptions({headers: this.headers});
          this.reqOptions.params = findReq;
          var that = this;
          return this.http.get(GET_URL, this.reqOptions)
          .toPromise()
          .then(function(resp){
            that.userProfile = resp.json();
            that._setSession(authData, that.userProfile);
            // console.log("In AuthService, userProfile 2 >>> ", that.userProfile);
            return that.userProfile;
          }).catch(function(error){
            console.log("ERROR IN getUserInfo: >>> ", error);
            if(error.status == 401){
              that.cookieService.deleteAll();
              that.accessToken = undefined;
              that.userProfile = undefined;
              that._setLoggedIn(false);
            }
          });

      }else{
          return Promise.reject("No User Found !! ");
      }
  }

  private _setSession(authResult, profile) {
    const expTime = authResult.expiresIn * 1000 + Date.now();
    // Save session data and update login status subject
    // localStorage.setItem('expires_at', JSON.stringify(expTime));
    // localStorage.setItem("userId", authResult.userId);
    // localStorage.setItem("accessToken", authResult.accessToken);
    this.accessToken = authResult.accessToken;
    this.userProfile = profile;
    this._setLoggedIn(true);
  }

  logout() {
    // localStorage.removeItem('expires_at');
    // localStorage.removeItem('userId');
    // localStorage.removeItem('accessToken');
    console.log("IN AuthService.logout:>>>>> ");
    let LOGOUT_URL: string = environment.API_BASE_URL + "/MyUsers/logout";
    this.reqOptions = new RequestOptions({headers: this.headers});
    var that = this;
    return this.http.post(LOGOUT_URL, {"sid": this.accessToken}, this.reqOptions)
            .toPromise()
            .then(function(resp){
              that.cookieService.deleteAll();
              that.accessToken = undefined;
              that.userProfile = undefined;
              that._setLoggedIn(false);
              console.log("LOGOUT RESP: >> ", resp);
              return resp;
          }).catch(this.handleErrorPromise);
  }

  get authenticated(): boolean {
    this.accessToken = this.getCookieVal('access_token');
    return this.accessToken && this.loggedIn;
  }

  private getAuthData(){
    var accessToken = this.getCookieVal('access_token');
    var userId = this.getCookieVal('userId');
    var expiresAt = Number(this.getCookieVal('expires_at'));

    return {"userId": userId, "expiresAt": expiresAt, accessToken: accessToken};

  }

  private getCookieVal(cookieName){
    var cookieVal = this.cookieService.get(cookieName);
    if(cookieVal && cookieVal.indexOf(":") != -1 && cookieVal.lastIndexOf(".") != -1){
      return cookieVal.substring(2, cookieVal.lastIndexOf("."));
    }
    return cookieVal;
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
