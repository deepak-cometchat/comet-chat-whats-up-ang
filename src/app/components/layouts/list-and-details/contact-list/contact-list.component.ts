import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  SimpleChanges,
} from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import * as enums from "../../../../utils/enums";
import { CONSTANTS } from "../../../../utils/constants";
@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit {
    @Input() friendsOnly = false;
    @Input() hasActions = false;
    @Input() item = null;
  
    @Output() onUserClick: EventEmitter<any> = new EventEmitter();
    @Output() actionGenerated: EventEmitter<any> = new EventEmitter();
  
    userListenerId = enums.USER_LIST_ + new Date().getTime();
    userSearches: boolean = false;
    loader: Boolean = true;
    contacts = [];
    usersList = [];
    usersRequest;
    timeout;
  
    USERS: String = CONSTANTS.USERS;
    SEARCH: String = CONSTANTS.SEARCH;
  
    constructor(private ref: ChangeDetectorRef) {
      try {
        setInterval(() => {
          if (!this.ref[enums.DESTROYED]) {
            this.ref.detectChanges();
          }
        }, 5000);
      } catch (error) {
        console.error(error);
      }
    }
  
    ngOnChanges(change: SimpleChanges) {
      try {
        if (change[enums.ITEM]) {
          if (
            change[enums.ITEM].previousValue !== change[enums.ITEM].currentValue
          ) {
            const userlist = [...this.usersList];
  
            let userKey = userlist.findIndex(
              (u, k) => u.uid === change[enums.ITEM].currentValue.uid
            );
  
            if (userKey > -1) {
              let userObj = userlist[userKey];
              let newUserObj = Object.assign(
                {},
                userObj,
                change[enums.ITEM].currentValue
              );
              userlist.splice(userKey, 1, newUserObj);
              this.usersList = [...userlist];
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  
    ngOnInit() {
      try {
        this.usersRequest = new CometChat.UsersRequestBuilder()
          .friendsOnly(this.friendsOnly)
          .setLimit(60)
          .build();
  
        let user = CometChat.getLoggedinUser().then(
          (user) => {
            this.fetchNextContactList();
          },
          (error) => {
            console.error(error);
          }
        );
  
        CometChat.addUserListener(
          this.userListenerId,
          new CometChat.UserListener({
            onUserOnline: (onlineUser) => {
  
              this.userUpdated(onlineUser);
            },
            onUserOffline: (offlineUser) => {
  
              this.userUpdated(offlineUser);
            },
          })
        );
      } catch (error) {
        console.error(error);
      }
    }
  
    ngOnDestroy() {
      try {
        this.ref.detach();
  
        CometChat.removeUserListener(this.userListenerId);
        this.userListenerId = null;
        this.usersRequest = null;
      } catch (error) {
        console.error(error);
      }
    }

    searchUsers(searchKey) {
      try {
  
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.userSearches = true;
        this.loader = true;
        let val = searchKey;
        this.timeout = setTimeout(() => {
          this.usersList = [];
  
          this.usersRequest = new CometChat.UsersRequestBuilder()
            .friendsOnly(this.friendsOnly)
            .setSearchKeyword(searchKey)
            .setLimit(30)
            .build();
  
          this.fetchNextContactList();
        }, 500);
      } catch (error) {
        console.error(error);
      }
    }
 
    handleScroll(e) {
      try {
        const bottom =
          Math.round(e.currentTarget.scrollHeight - e.currentTarget.scrollTop) ===
          Math.round(e.currentTarget.clientHeight);
  
        if (bottom) this.fetchNextContactList();
      } catch (error) {
        console.error(error);
      }
    }

    fetchNextContactList() {
      try {
        this.usersRequest.fetchNext().then(
          (userList) => {
            if (userList.length === 0 && this.userSearches === true) {
            } else {
              this.userSearches = false;
              this.usersList = [...this.usersList, ...userList];
              this.loader = false;
            }
          },
          (error) => {
            console.error(error);
          }
        );
      } catch (error) {
        console.error(error);
      }
    }

    userUpdated = (user) => {
      try {
        let userlist = [...this.usersList];
  
        let userKey = userlist.findIndex((u, k) => u.uid === user.uid);
  
        if (userKey > -1) {
          let userObj = { ...userlist[userKey] };
          let newUserObj = { ...userObj, ...user };
          userlist.splice(userKey, 1, newUserObj);
  
          this.usersList = [...userlist];
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    onUserClicked(userToEmit) {
      try {
        this.onUserClick.emit(userToEmit);
      } catch (error) {
        console.error(error);
      }
    }

}
