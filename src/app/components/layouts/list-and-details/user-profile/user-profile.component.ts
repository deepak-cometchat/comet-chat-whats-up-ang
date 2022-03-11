import { Component, OnInit } from '@angular/core';
import { CometChat } from "@cometchat-pro/chat";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user;
  name: string;
  enableUserStatus: boolean = true;
  userStatus = 'online';
  constructor() { }

  ngOnInit(): void {
    try {
      this.getProfile();
    } catch (error) {
     console.error(error);
    }
  }

  getProfile() {
    try {
      CometChat.getLoggedinUser()
        .then((user) => {
          this.user = user;
          this.name = this.user.name;
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  }

  logOut() {
    try {
      localStorage.removeItem('user')
      CometChat.logout()
        .then((user) => {
          window.location.reload();
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }

  
  }

}
