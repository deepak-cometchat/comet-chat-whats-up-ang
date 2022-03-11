import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import {CometChat} from "@cometchat-pro/chat";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginData: any = {};
  user : any = {};

  constructor(
      private service: AuthService,
      private router: Router,
      private spinner: NgxSpinnerService,
  ) { }

  ngOnInit(): void {
  }

  login() {
    this.cometLogin(this.loginData.phone)
  }


  cometLogin(uid) {
        this.spinner.show();
        const authKey = "ee5c46f58e42449d273722588351ae92af3df9c4";
        CometChat.login(uid, authKey).then(
            (user) => {
                this.spinner.hide();
                console.log("Login Successful:", { user });
                localStorage.setItem('user', JSON.stringify(user));
                this.router.navigate(["/"]);
            },
            (error) => {
                this.spinner.hide();
                console.log("Login failed with exception:", { error });
            }
        );
    }
}
