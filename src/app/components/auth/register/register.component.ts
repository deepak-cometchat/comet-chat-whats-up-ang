import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../../services/auth/auth.service";
import {Router} from "@angular/router";
import {CometChat} from "@cometchat-pro/chat";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerData : any = {}; user : any = {};
  constructor(
    private service: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit(): void {
  }

  register() {

    let name = this.registerData.username;
    let uid = this.registerData.phone;
    let metadata = this.registerData;
    let data = {uid, name, metadata};
    this.spinner.show();
    this.service.register(data)
        .subscribe(() => {
            this.cometLogin(uid, data);
     })
  }
    cometLogin(uid, udata) {
   
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
