import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { MyAuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private auth: MyAuthService,
    private router: Router
  ) { }

  canActivate() {
    if (this.auth.authenticated) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }

}
