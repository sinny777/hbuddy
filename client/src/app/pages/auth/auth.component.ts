import { Component, OnInit } from '@angular/core';
// import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {


  constructor() { }

  ngOnInit() {
      // your other code
    setTimeout(() => {
      document.getElementById("loginModalLink").click();
    }, 200);
  }

}
