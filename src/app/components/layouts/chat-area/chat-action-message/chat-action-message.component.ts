import { Component, Input, OnInit } from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import { CONSTANTS } from "../../../../utils/constants";
import * as enums from "../../../../utils/enums";

@Component({
  selector: "chat-action-message",
  templateUrl: "./chat-action-message.component.html",
  styleUrls: ["./chat-action-message.component.css"],
})
export class ChatActionMessageComponent implements OnInit {
  @Input() messageDetails = null;
  @Input() loggedInUserUid;
  message;
  constructor() {}

  ngOnInit() {
    try {
      this.getMessage();
    } catch (error) {
      console.error(error);
    }
  }
  
  getMessage() {
    try {
      const call = this.messageDetails;
      switch (call.status) {
        case CometChat.CALL_STATUS.INITIATED: {
          this.message = CONSTANTS.CALL_INITIATED;
          if (call.type === CometChat.CALL_TYPE.AUDIO) {
            if (call.receiverType === CometChat.RECEIVER_TYPE.USER) {
              this.message =
                call.callInitiator.uid === this.loggedInUserUid
                  ? CONSTANTS.OUTGOING_AUDIO_CALL
                  : CONSTANTS.INCOMING_AUDIO_CALL;
            } else if (call.receiverType === CometChat.RECEIVER_TYPE.GROUP) {
              if (call.action === CometChat.CALL_STATUS.INITIATED) {
                this.message =
                  call.callInitiator.uid === this.loggedInUserUid
                    ? CONSTANTS.OUTGOING_AUDIO_CALL
                    : CONSTANTS.INCOMING_AUDIO_CALL;
              } else if (call.action === CometChat.CALL_STATUS.REJECTED) {
                this.message =
                  call.sender.uid === this.loggedInUserUid
                    ? CONSTANTS.CALL_REJECTED
                    : `${call.sender.name} ` +
                      CONSTANTS.REJECTED_CALL;
              }
            }
          } else if (call.type === CometChat.CALL_TYPE.VIDEO) {
            if (call.receiverType === CometChat.RECEIVER_TYPE.USER) {
              this.message =
                call.callInitiator.uid === this.loggedInUserUid
                  ? CONSTANTS.OUTGOING_VIDEO_CALL
                  : CONSTANTS.INCOMING_VIDEO_CALL;
            } else if (call.receiverType === CometChat.RECEIVER_TYPE.GROUP) {
              if (call.action === CometChat.CALL_STATUS.INITIATED) {
                this.message =
                  call.callInitiator.uid === this.loggedInUserUid
                    ? CONSTANTS.OUTGOING_VIDEO_CALL
                    : CONSTANTS.INCOMING_VIDEO_CALL;
              } else if (call.action === CometChat.CALL_STATUS.REJECTED) {
                this.message =
                  call.sender.uid === this.loggedInUserUid
                    ? CONSTANTS.CALL_REJECTED
                    : `${call.sender.name} ` +
                      CONSTANTS.REJECTED_CALL;
              }
            }
          }
          break;
        }
        case CometChat.CALL_STATUS.ONGOING: {
          if (call.receiverType === CometChat.RECEIVER_TYPE.USER) {
            this.message = CONSTANTS.CALL_ACCEPTED;
          } else if (call.receiverType === CometChat.RECEIVER_TYPE.GROUP) {
            if (call.action === CometChat.CALL_STATUS.ONGOING) {
              this.message =
                call.sender.uid === this.loggedInUserUid
                  ? CONSTANTS.CALL_ACCEPTED
                  : `${call.sender.name} ` + CONSTANTS.JOINED;
            } else if (call.action === CometChat.CALL_STATUS.REJECTED) {
              this.message =
                call.sender.uid === this.loggedInUserUid
                  ? CONSTANTS.CALL_REJECTED
                  : `${call.sender.name} ` + CONSTANTS.REJECTED_CALL;
            } else if (call.action === enums.LEFT) {
              this.message =
                call.sender.uid === this.loggedInUserUid
                  ? CONSTANTS.YOU +
                    " " +
                    CONSTANTS.LEFT_THE_CALL
                  : `${call.sender.name} ` + CONSTANTS.LEFT_THE_CALL;
            }
          }

          break;
        }
        case CometChat.CALL_STATUS.UNANSWERED: {
          this.message = CONSTANTS.CALL_UNANSWERED;
          if (
            call.type === CometChat.CALL_TYPE.AUDIO &&
            (call.receiverType === CometChat.RECEIVER_TYPE.USER ||
              call.receiverType === CometChat.RECEIVER_TYPE.GROUP)
          ) {
            this.message =
              call.callInitiator.uid === this.loggedInUserUid
                ? CONSTANTS.UNANSWERED_AUDIO_CALL
                : CONSTANTS.MISSED_AUDIO_CALL;
          } else if (
            call.type === CometChat.CALL_TYPE.VIDEO &&
            (call.receiverType === CometChat.RECEIVER_TYPE.USER ||
              call.receiverType === CometChat.RECEIVER_TYPE.GROUP)
          ) {
            this.message =
              call.callInitiator.uid === this.loggedInUserUid
                ? CONSTANTS.UNANSWERED_VIDEO_CALL
                : CONSTANTS.MISSED_VIDEO_CALL;
          }
          break;
        }
        case CometChat.CALL_STATUS.REJECTED: {
          this.message = CONSTANTS.CALL_REJECTED;
          break;
        }
        case CometChat.CALL_STATUS.ENDED:
          this.message = CONSTANTS.CALL_ENDED;
          break;
        case CometChat.CALL_STATUS.CANCELLED:
          this.message = CONSTANTS.CALL_CANCELLED;
          break;
        case CometChat.CALL_STATUS.BUSY:
          this.message = CONSTANTS.CALL_BUSY;
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }
}
