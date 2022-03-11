import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import * as enums from "../../../utils/enums";
import { CometChat } from "@cometchat-pro/chat";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() type = null;
  @Input() item = null;
  @Output() onUserClick: EventEmitter<any> = new EventEmitter();
  curentItem;
  lastMessage;
  currentType = 'chatList';
  constructor() {
  }

  ngOnInit(): void {


  }

  changeTab(type): void {
    this.currentType = type;
  }


  userClicked(user) {
    try {
      if (user.hasOwnProperty(enums.CONVERSATION_WITH)) {
        this.item = user.conversationWith;
        this.curentItem = this.item;
      } else {
        this.item = user;
        this.curentItem = this.item;
      }
      if (this.item.hasOwnProperty(enums.UID)) {
        this.type = CometChat.RECEIVER_TYPE.USER;
      } else {
        this.type = CometChat.RECEIVER_TYPE.GROUP;
      }
      this.lastMessage = user.lastMessage;
      this.onUserClick.emit(this.item);
    } catch (error) {
      console.error(error);
    }
  }

  groupClicked(group) {
    try {
      this.item = group;
      this.curentItem = this.item;

      if (this.item.hasOwnProperty(enums.UID)) {
        this.type = CometChat.RECEIVER_TYPE.USER;
      } else {
        this.type = CometChat.RECEIVER_TYPE.GROUP;
      }

      this.onUserClick.emit(this.item);
    } catch (error) {
      console.error(error);
    }
  }


}
