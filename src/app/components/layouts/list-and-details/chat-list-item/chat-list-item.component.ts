import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  EventEmitter,
} from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import * as enums from "../../../../utils/enums";
import { CONSTANTS } from "../../../../utils/constants";

@Component({
  selector: "chat-list-item",
  templateUrl: "./chat-list-item.component.html",
  styleUrls: ["./chat-list-item.component.css"],
})
export class ChatListItemComponent
  implements OnInit, OnChanges {
  @Input() conversationDetails = null;
  @Input() loggedInUser = null;
  @Output() onUserClick: EventEmitter<any> = new EventEmitter();

  lastMessage: string;
  lastMessageTimestamp: string;
  lastMessageName: string;

  constructor() {}

  ngOnChanges(change: SimpleChanges) {
    try {
      if (change[enums.CONVERSATION_DETAILS]) {
        if (
          change[enums.CONVERSATION_DETAILS].currentValue !==
          change[enums.CONVERSATION_DETAILS].previousValue
        ) {
          this.getLastMessage(change[enums.CONVERSATION_DETAILS].currentValue);
          this.getLastMessageTimestamp(
            change[enums.CONVERSATION_DETAILS].currentValue
          );
          this.getName(change[enums.CONVERSATION_DETAILS].currentValue);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit() {
    try {
      this.getLastMessage(this.conversationDetails);
      this.getLastMessageTimestamp(this.conversationDetails);
      this.getName(this.conversationDetails);
    } catch (error) {
      console.error(error);
    }
  }

  getName(data) {
    try {
      this.lastMessageName = data.conversationWith.name;
      return this.lastMessageName;
    } catch (error) {
      console.error(error);
    }
  }

  getLastMessage(data) {
    try {
      if (data === null) {
        return false;
      }
      if (data.hasOwnProperty(enums.LAST_MESSAGE) === false) {
        return false;
      }
      let message = null;
      const lastMessage = data.lastMessage;

      if (lastMessage.hasOwnProperty(enums.DELETED_AT)) {
        message =
          this.loggedInUser.uid === lastMessage.sender.uid
            ? CONSTANTS.YOU_DELETED_THIS_MESSAGE
            : CONSTANTS.THIS_MESSAGE_DELETED;
      } else {
        switch (lastMessage.category) {
          case CometChat.CATEGORY_MESSAGE:
            message = this.getMessage(lastMessage);
            break;
          case CometChat.CATEGORY_CALL:
            message = this.getCallMessage(lastMessage);
            break;
          case CometChat.CATEGORY_ACTION:
            message = lastMessage.message;
            break;
          default:
            break;
        }
      }
      this.lastMessage = message;
      return this.lastMessage;
    } catch (error) {
      console.error(error);
    }
  }

  getLastMessageTimestamp(data) {
    try {
      if (data === null) {
        return false;
      }

      if (data.hasOwnProperty(enums.LAST_MESSAGE) === false) {
        return false;
      }
      if (data.lastMessage.hasOwnProperty(enums.SENT_AT) === false) {
        return false;
      }
      let timestamp = null;

      const messageTimestamp: any = new Date(data.lastMessage.sentAt * 1000);
      const currentTimestamp = Date.now();
      const diffTimestamp = currentTimestamp - messageTimestamp;
      if (diffTimestamp < 24 * 60 * 60 * 1000) {
        timestamp = messageTimestamp.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
      } else if (diffTimestamp < 48 * 60 * 60 * 1000) {
        timestamp = CONSTANTS.YESTERDAY;
      } else if (diffTimestamp < 7 * 24 * 60 * 60 * 1000) {
        timestamp = messageTimestamp.toLocaleString("en-US", {
          weekday: "long",
        });
      } else {
        timestamp = messageTimestamp.toLocaleDateString("en-US", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        });
      }
      this.lastMessageTimestamp = timestamp;
      return this.lastMessageTimestamp;
    } catch (error) {
      console.error(error);
    }
  }

  getMessage(lastMessage) {
    try {
      let message = null;
      switch (lastMessage.type) {
        case CometChat.MESSAGE_TYPE.TEXT:
          message = lastMessage.text;
          break;
        default:
          break;
      }
      return message;
    } catch (error) {
      console.error(error);
    }
  }

  getCallMessage(lastMessage) {
    try {
      let message = null;
      switch (lastMessage.type) {
        case CometChat.MESSAGE_TYPE.VIDEO:
          message = CONSTANTS.VIDEO_CALL;
          break;
        case CometChat.MESSAGE_TYPE.AUDIO:
          message = CONSTANTS.AUDIO_CALL;
          break;
        default:
          break;
      }

      return message;
    } catch (error) {
      console.error(error);
    }
  }

  onUserClicked(userToEmit) {
    try {
      this.onUserClick.emit(userToEmit);
    } catch (error) {
      console.error(error);
    }
  }
}
