import {
  Component,
  Input,
  OnInit,
  EventEmitter,
  Output,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import * as enums from "../../../../utils/enums";
import { CONSTANTS } from "../../../../utils/constants";
import { DatePipe } from "@angular/common";

@Component({
  selector: "chat-message-header",
  templateUrl: "./chat-message-header.component.html",
  styleUrls: ["./chat-message-header.component.css"],
})
export class ChatMessageHeaderComponent
  implements OnInit, OnChanges, OnDestroy {
  @Input() item = null;
  @Input() type = null;

  @Output() actionGenerated: EventEmitter<any> = new EventEmitter();

  userListenerId = enums.HEAD_USER_ + new Date().getTime();
  msgListenerId = enums.HEAD_MESSAGE_ + new Date().getTime();
  groupListenerId = enums.HEAD_GROUP_ + new Date().getTime();
  status: string = "";
  isTyping: boolean = false;
  loggedInUser = null;
  GROUP: String = CometChat.RECEIVER_TYPE.GROUP;
  USER: String = CometChat.RECEIVER_TYPE.USER;
  ONLINE: String = CometChat.USER_STATUS.ONLINE;
  OFFLINE: String = CometChat.USER_STATUS.OFFLINE;


  constructor(public datepipe: DatePipe) {}

  ngOnChanges(change: SimpleChanges) {
    try {
      if (change[enums.ITEM]) {

        this.removeListeners();

        if (this.type == CometChat.RECEIVER_TYPE.GROUP) {
          let prevProps = {
            item:
              change[enums.ITEM].previousValue == null
                ? { guid: "" }
                : change[enums.ITEM].previousValue,
          };
          let props = { item: change[enums.ITEM].currentValue };

          if (
            prevProps.item.guid === props.item.guid &&
            prevProps.item.membersCount !== props.item.membersCount
          ) {
            this.updateHeader(enums.GROUP_MEMBER_ADDED, props.item);
          }

          if (prevProps.item.guid !== props.item.guid) {
            this.setGroupMemeberCountStatus(this.item.membersCount);
          }
        }

        this.userListenerId = enums.HEAD_USER_ + new Date().getTime();
        this.msgListenerId = enums.HEAD_MESSAGE_ + new Date().getTime();
        this.groupListenerId = enums.HEAD_GROUP_ + new Date().getTime();
        this.attachListeners();
      }
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit() {
    try {
      this.attachListeners();

      this.getLoggedInUserInfo();

      if (this.type == CometChat.RECEIVER_TYPE.GROUP) {
        this.setGroupMemeberCountStatus(this.item.membersCount);
      }
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy() {
    try {
      this.removeListeners();
    } catch (error) {
      console.error(error);
    }
  }

  getLoggedInUserInfo() {
    try {
      CometChat.getLoggedinUser()
        .then((user) => {
          this.loggedInUser = user;
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  }

  attachListeners() {
    try {
      CometChat.addUserListener(
        this.userListenerId,
        new CometChat.UserListener({
          onUserOnline: (onlineUser) => {

            this.updateHeader(enums.USER_ONLINE, onlineUser);
          },
          onUserOffline: (offlineUser) => {

            this.updateHeader(enums.USER_OFFLINE, offlineUser);
          },
        })
      );

      CometChat.addMessageListener(
        this.msgListenerId,
        new CometChat.MessageListener({
          onTypingStarted: (typingIndicator) => {
            this.updateHeader(enums.TYPING_STARTED, typingIndicator);
          },
          onTypingEnded: (typingIndicator) => {
            this.updateHeader(enums.TYPING_ENDED, typingIndicator);
          },
        })
      );

      CometChat.addGroupListener(
        this.groupListenerId,
        new CometChat.GroupListener({
          onGroupMemberKicked: (message, kickedUser, kickedBy, kickedFrom) => {
            this.updateHeader(
              enums.GROUP_MEMBER_KICKED,
              kickedFrom,
              kickedUser
            );
          },
          onGroupMemberBanned: (message, bannedUser, bannedBy, bannedFrom) => {
            this.updateHeader(
              enums.GROUP_MEMBER_BANNED,
              bannedFrom,
              bannedUser
            );
          },
          onMemberAddedToGroup: (
            message,
            userAdded,
            userAddedBy,
            userAddedIn
          ) => {
            this.updateHeader(enums.GROUP_MEMBER_ADDED, userAddedIn);
          },
          onGroupMemberLeft: (message, leavingUser, group) => {
            this.updateHeader(enums.GROUP_MEMBER_LEFT, group, leavingUser);
          },
          onGroupMemberJoined: (message, joinedUser, joinedGroup) => {
            this.updateHeader(enums.GROUP_MEMBER_JOINED, joinedGroup);
          },
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  removeListeners() {
    try {
      CometChat.removeUserListener(this.userListenerId);
      CometChat.removeMessageListener(this.msgListenerId);
      CometChat.removeGroupListener(this.groupListenerId);
    } catch (error) {
      console.error(error);
    }
  }

  updateHeader(key = null, item = null, groupUser = null) {
    try {
      switch (key) {
        case enums.USER_ONLINE:
        case enums.USER_OFFLINE: {
          if (
            this.type === CometChat.RECEIVER_TYPE.USER &&
            this.item.uid === item.uid
          ) {
            this.item = { ...item };
          }
          break;
        }
        case enums.TYPING_STARTED: {
          if (
            this.type === CometChat.RECEIVER_TYPE.GROUP &&
            this.type === item.receiverType &&
            this.item.guid === item.receiverId
          ) {
            this.status = item.sender.name + CONSTANTS.IS_TYPING;
            this.actionGenerated.emit({
              type: enums.SHOW_REACTION,
              payLoad: item,
            });
          } else if (
            this.type === CometChat.RECEIVER_TYPE.USER &&
            this.type === item.receiverType &&
            this.item.uid === item.sender.uid
          ) {
            this.isTyping = true;
            this.status = CONSTANTS.TYPING;
            this.actionGenerated.emit({
              type: enums.SHOW_REACTION,
              payLoad: item,
            });
          }
          break;
        }
        case enums.TYPING_ENDED: {
          if (
            this.type === CometChat.RECEIVER_TYPE.GROUP &&
            this.type === item.receiverType &&
            this.item.guid === item.receiverId
          ) {
            this.setGroupMemeberCountStatus(this.item.membersCount);

            this.actionGenerated.emit({
              type: enums.STOP_REACTION,
              payLoad: item,
            });
          } else if (
            this.type === CometChat.RECEIVER_TYPE.USER &&
            this.type === item.receiverType &&
            this.item.uid === item.sender.uid
          ) {
            if (this.item.status === CometChat.USER_STATUS.ONLINE) {
              this.status = null;
              this.isTyping = false;
            } else {
              this.getLastActiveDate(item.lastActiveAt);
            }
            this.actionGenerated.emit({
              type: enums.STOP_REACTION,
              payLoad: item,
            });
          }
          break;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  setGroupMemeberCountStatus(membersCount) {
    try {
      if (membersCount > 1) {
        this.status = membersCount + " members";
      } else {
        this.status = membersCount + " member";
      }
    } catch (error) {
      console.error(error);
    }
  }

  getLastActiveDate(date) {
    try {
      let lastActiveDate = CONSTANTS.LAST_ACTIVE_AT;

      if (date === undefined) {
        lastActiveDate = CometChat.USER_STATUS.OFFLINE;
        return lastActiveDate;
      }
      date = date * 1000;
      lastActiveDate =
      lastActiveDate + this.datepipe.transform(date, "dd MMMM yyyy, h:mm a");

      return lastActiveDate;
    } catch (error) {
      console.error(error);
    }
  }

  audioCall() {
    try {
      this.actionGenerated.emit({ type: enums.AUDIO_CALL });
    } catch (error) {
      console.error(error);
    }
  }

  videoCall() {
    try {
      this.actionGenerated.emit({ type: enums.VIDEO_CALL });
    } catch (error) {
      console.error(error);
    }
  }
}
