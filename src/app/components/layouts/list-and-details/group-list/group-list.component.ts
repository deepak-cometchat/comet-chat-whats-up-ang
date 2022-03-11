import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import * as enums from "../../../../utils/enums";
import { CONSTANTS } from "../../../../utils/constants";

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent   implements OnInit, OnDestroy  {
  @Input() enableSelectedGroupStyling = false;

  timeout;
  loggedInUser = null;
  selectedGroup = null;
  groupList = [];
  groupRequest = null;
  groupListenerId = enums.GROUP_LIST_ + new Date().getTime();

  GROUPS: String = CONSTANTS.GROUPS;
  SEARCH: String = CONSTANTS.SEARCH;

  @Output() onGroupClick: EventEmitter<any> = new EventEmitter();

  constructor(private ref: ChangeDetectorRef) {
    setInterval(() => {
      if (!this.ref[enums.DESTROYED]) {
        this.ref.detectChanges();
      }
    }, 5000);
  }


  ngOnInit() {
    try {
      this.groupRequest = this.groupListRequestBuilder();
      this.getGroups();
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy() {
    try {
      CometChat.removeGroupListener(this.groupListenerId);
    } catch (error) {
      console.error(error);
    }
  }


  groupListRequestBuilder() {
    try {
       let groupRequest = null;

        groupRequest = new CometChat.GroupsRequestBuilder()
          .setLimit(30)
          .build();

      return groupRequest;
    } catch (error) {
      console.error(error);
    }
  }

  getGroups = () => {
    try {

      CometChat.getLoggedinUser()
        .then((user) => {
          this.loggedInUser = user;
          this.fetchNextGroups()
            .then((groupList) => {
           

              this.groupList = [...this.groupList, ...groupList];

            })
            .catch((error) => {
              console.error(
                error
              );
            });
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  fetchNextGroups() {
    try {
      return this.groupRequest.fetchNext();
    } catch (error) {
      console.error(error);
    }
  }

  groupClicked(group) {
    try {
        this.onGroupClick.emit(group);
      
    } catch (error) {
      console.error(error);
    }
  }

  handleScroll(e) {
    try {
      const bottom =
        Math.round(e.currentTarget.scrollHeight - e.currentTarget.scrollTop) ===
        Math.round(e.currentTarget.clientHeight);

      if (bottom) this.getGroups();
    } catch (error) {
      console.error(error);
    }
  }
}
