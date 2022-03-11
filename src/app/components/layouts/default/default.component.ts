import { Component, OnInit } from '@angular/core';
import * as enums from "../../../utils/enums";
import { CometChat } from "@cometchat-pro/chat";
import { ChatCallManager } from "../../../utils/chatCallManager";

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.css']
})
export class DefaultComponent implements OnInit {
  item = null;
  curentItem;
  type;
  incomingCall = null;
  outgoingCall = null;
  lastMessage;
  callMessage;
  constructor() { }

  ngOnInit(): void {
  }

  userClicked(user) {
    try {
      this.item = user;
      if (this.item.hasOwnProperty(enums.UID)) {
        this.type = CometChat.RECEIVER_TYPE.USER;
      } else {
        this.type = CometChat.RECEIVER_TYPE.GROUP;
      }
    } catch (error) {
      console.error(error);
    }
  }

  updateLastMessage(message) {
    try {
      this.lastMessage = message;
    } catch (error) {
      console.error(error);
    }
  }

  appendCallMessage(call) {
    try {
      this.callMessage = call;
    } catch (error) {
      console.error(error);
    }
  }

  audioCall() {
    try {
      let receiverId, receiverType;
      if (this.type === CometChat.RECEIVER_TYPE.USER) {
        receiverId = this.item.uid;
        receiverType = CometChat.RECEIVER_TYPE.USER;
      } else if (this.type === CometChat.RECEIVER_TYPE.GROUP) {
        receiverId = this.item.guid;
        receiverType = CometChat.RECEIVER_TYPE.GROUP;
      }

      ChatCallManager.call(receiverId, receiverType, CometChat.CALL_TYPE.AUDIO)
        .then((call) => {
          this.appendCallMessage(call);
          this.outgoingCall = call;
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  }
  videoCall = () => {
    try {
      let receiverId, receiverType;
      if (this.type === CometChat.RECEIVER_TYPE.USER) {
        receiverId = this.item.uid;
        receiverType = CometChat.RECEIVER_TYPE.USER;
      } else if (this.type === CometChat.RECEIVER_TYPE.GROUP) {
        receiverId = this.item.guid;
        receiverType = CometChat.RECEIVER_TYPE.GROUP;
      }

      ChatCallManager.call(receiverId, receiverType, CometChat.CALL_TYPE.VIDEO)
        .then((call) => {
          this.appendCallMessage(call);
          this.outgoingCall = call;
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  outgoingCallEnded(message) {
    try {
      this.outgoingCall = null;
      this.incomingCall = null;
      this.appendCallMessage(message);
    } catch (error) {
      console.error(error);
    }
  }

  acceptIncomingCall(call) {
    try {
      this.incomingCall = call;

      const type = call.receiverType;
      const id =
        type === CometChat.RECEIVER_TYPE.USER
          ? call.sender.uid
          : call.receiverId;

      CometChat.getConversation(id, type)
        .then((conversation: any) => {
          this.item = { ...conversation.conversationWith };
          this.type = type;
        })
        .catch((error) => {
          console.error("error while fetching a conversation", error);
        });
    } catch (error) {
      console.error(error);
    }
  }

  callInitiated(message) {
    try {
      this.appendCallMessage(message);
    } catch (error) {
      console.error(error);
    }
  }

  rejectedIncomingCall(call) {
    try {
      let incomingCallMessage = call.incomingCall;
      let rejectedCallMessage = call.rejectedCall;
      let receiverType = incomingCallMessage.receiverType;
      let receiverId =
        receiverType === CometChat.RECEIVER_TYPE.USER
          ? incomingCallMessage.sender.uid
          : incomingCallMessage.receiverId;

      if (incomingCallMessage.hasOwnProperty(enums.READ_AT) === false) {
        CometChat.markAsRead(incomingCallMessage.id, receiverId, receiverType);
      }

      let item = this.item;
      let type = this.type;

      receiverType = rejectedCallMessage.receiverType;
      receiverId = rejectedCallMessage.receiverId;

      if (
        (type === CometChat.RECEIVER_TYPE.GROUP &&
          receiverType === CometChat.RECEIVER_TYPE.GROUP &&
          receiverId === item.guid) ||
        (type === CometChat.RECEIVER_TYPE.USER &&
          receiverType === CometChat.RECEIVER_TYPE.USER &&
          receiverId === item.uid)
      ) {
        this.appendCallMessage(rejectedCallMessage);
      }
    } catch (error) {
      console.error(error);
    }
  }

  actionHandler(action = null, item = null, count = null) {
    try {
      let message = action.payLoad;

      let data = action.payLoad;

      switch (action.type) {
        case enums.MESSAGE_COMPOSED:
          this.updateLastMessage(message);
          break;
        case enums.AUDIO_CALL: {
          this.audioCall();
          break;
        }
        case enums.VIDEO_CALL:
          this.videoCall();
          break;
        case enums.OUT_GOING_CALL_REJECTED:
        case enums.OUTGOING_CALL_REJECTED:
        case enums.OUTGOING_CALL_CANCELLED:
        case enums.CALL_ENDED_BY_USER:
        case enums.CALL_ENDED: {
          this.outgoingCallEnded(message);
          break;
        }
        case enums.USER_JOINED_CALL:
        case enums.USER_LEFT_CALL: {
          break;
        }
        case enums.ACCEPT_INCOMING_CALL: {
          this.acceptIncomingCall(message);
          break;
        }
        case enums.ACCEPTED_INCOMING_CALL: {
          this.callInitiated(message);
          break;
        }
        case enums.REJECTED_INCOMING_CALL: {
          this.rejectedIncomingCall(message);
          break;
        }
        case enums.CALL_ERROR: {
          console.error(
            action.payLoad
          );
        }
        default:
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }

}
