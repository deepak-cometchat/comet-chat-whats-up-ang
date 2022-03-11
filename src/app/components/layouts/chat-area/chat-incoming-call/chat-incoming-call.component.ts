import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import * as enums from "../../../../utils/enums";
import { CometChat } from "@cometchat-pro/chat";
import { ChatCallManager } from "../../../../utils/chatCallManager";
import { CONSTANTS } from "../../../../utils/constants";

@Component({
  selector: "chat-incoming-call",
  templateUrl: "./chat-incoming-call.component.html",
  styleUrls: ["./chat-incoming-call.component.css"],
})
export class ChatIncomingCallComponent implements OnInit {
  incomingCall = null;
  callInProgress = null;
  callListenerId = enums.INCOMING_CALL_ + new Date().getTime();
  @Output() actionGenerated: EventEmitter<any> = new EventEmitter();

  user;
  name: string;
  audio;

  INCOMING_AUDIO_CALL: String = CONSTANTS.INCOMING_AUDIO_CALL;
  INCOMING_VIDEO_CALL: String = CONSTANTS.INCOMING_VIDEO_CALL;
  DECLINE: String = CONSTANTS.DECLINE;
  ACCEPT: String = CONSTANTS.ACCEPT;

  CALL_TYPE_AUDIO: String = CometChat.CALL_TYPE.AUDIO;
  CALL_TYPE_VIDEO: String = CometChat.CALL_TYPE.VIDEO;

  constructor() {}

  ngOnInit() {
    try {
      this.attachListeners();
      this.loadAudio();
    } catch (error) {
      console.error(error);
    }
  }

  attachListeners() {
    try {
      CometChat.addCallListener(
        this.callListenerId,
        new CometChat.CallListener({
          onIncomingCallReceived: (call) => {
            this.callScreenUpdated(enums.INCOMING_CALL_RECEIVED, call);
          },
          onIncomingCallCancelled: (call) => {
            this.callScreenUpdated(enums.INCOMING_CALL_CANCELLED, call);
          },
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  removeListeners() {
    try {
      CometChat.removeCallListener(this.callListenerId);
    } catch (error) {
      console.error(error);
    }
  }

  callScreenUpdated(key, call) {
    try {
      switch (key) {
        case enums.INCOMING_CALL_RECEIVED: {
          this.incomingCallReceived(call);
          break;
        }
        case enums.INCOMING_CALL_CANCELLED: {
          this.incomingCallCancelled(call);
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }

  incomingCallReceived(incomingCall) {
    try {
      this.user = incomingCall.sender;
      this.name = incomingCall.sender.name;
      const activeCall = CometChat.getActiveCall();

      if (activeCall) {
        CometChat.rejectCall(incomingCall.sessionId, CometChat.CALL_STATUS.BUSY)
          .then((rejectedCall) => {
            this.actionGenerated.emit({
              type: enums.REJECTED_INCOMING_CALL,
              payLoad: { incomingCall, rejectedCall: rejectedCall },
            });
          })
          .catch((error) => {
            this.actionGenerated.emit({
              type: enums.CALL_ERROR,
              payLoad: error,
            });

            console.error(error);
          });
      } else if (this.incomingCall === null) {
        this.incomingCall = incomingCall;
        if (this.incomingCall !== null) {
          this.playAudio();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  


  incomingCallCancelled(call) {
    this.pauseAudio();
    this.incomingCall = null;
  }

  rejectCall() {
    try {
      this.pauseAudio();
      ChatCallManager.rejectCall(
        this.incomingCall.sessionId,
        CometChat.CALL_STATUS.REJECTED
      )
        .then((rejectedCall) => {
          this.actionGenerated.emit({
            type: enums.REJECTED_INCOMING_CALL,
            payLoad: {
              incomingCall: this.incomingCall,
              rejectedCall: rejectedCall,
            },
          });
          this.incomingCall = null;
        })
        .catch((error) => {
          this.actionGenerated.emit({ type: enums.CALL_ERROR, payLoad: error });
          this.incomingCall = null;
        });
    } catch (error) {
      console.error(error);
    }
  }

  acceptCall() {
    try {
      this.pauseAudio();

      this.actionGenerated.emit({
        type: enums.ACCEPT_INCOMING_CALL,
        payLoad: this.incomingCall,
      });
      this.incomingCall = null;
    } catch (error) {
      console.error(error);
    }
  }

  loadAudio() {
    try {
      this.audio = new Audio();
      this.audio.src = "../../../../../assets/media/incomCall.wav";
    } catch (error) {
      console.error(error);
    }
  }

  playAudio() {
    try {
      this.audio.currentTime = 0;
      if (typeof this.audio.loop == enums.Boolean) {
        this.audio.loop = true;
      } else {
        this.audio.addEventListener(
          enums.ENDED,
          function () {
            this.currentTime = 0;
            this.play();
          },
          false
        );
      }
      this.audio.play();
    } catch (error) {
      console.error(error);
    }
  }

  pauseAudio() {
    try {
      this.audio.pause();
    } catch (error) {
      console.error(error);
    }
  }
}
