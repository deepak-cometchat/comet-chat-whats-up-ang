import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  OnDestroy,
} from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import * as enums from "../../../../utils/enums";
import { ChatCallManager } from "../../../../utils/chatCallManager";
import { CONSTANTS } from "../../../../utils/constants";
@Component({
  selector: "chat-outgoing-call",
  templateUrl: "./chat-outgoing-call.component.html",
  styleUrls: ["./chat-outgoing-call.component.css"],
})
export class ChatOutgoingCallComponent
  implements OnInit, OnChanges, OnDestroy {
  @ViewChild("callScreenFrame", { static: false }) callScreenFrame: ElementRef;

  @Input() item = null;
  @Input() type = null;
  @Input() incomingCall = null;
  @Input() outgoingCall = null;

  callInProgress = null;
  callListenerId = enums.CALL_SCREEN_ + new Date().getTime();
  outgoingCallScreen: boolean = false;
  errorScreen: boolean = false;
  errorMessage: String = "";

  @Output() actionGenerated: EventEmitter<any> = new EventEmitter();

  loggedInUser = null;
  audio;

  CALLING: String = CONSTANTS.CALLING;

  constructor() {}

  ngOnChanges(change: SimpleChanges) {
    try {
      if (change[enums.OUTGOING_CALL]) {
        let prevProps = { outgoingCall: null };
        let props = { outgoingCall: null };

        prevProps[enums.OUTGOING_CALL] =
          change[enums.OUTGOING_CALL].previousValue;
        props[enums.OUTGOING_CALL] = change[enums.OUTGOING_CALL].currentValue;

        if (
          prevProps.outgoingCall !== props.outgoingCall &&
          props.outgoingCall
        ) {
          this.playAudio();

          let call = props.outgoingCall;
          this.outgoingCallScreen = true;
          this.callInProgress = call;
          this.errorScreen = false;
          this.errorMessage = "";
        }
      }

      if (change[enums.INCOMING_CALL]) {
        let prevProps = { incomingCall: null };
        let props = { incomingCall: null };

        prevProps = {
          ...prevProps,
          ...change[enums.INCOMING_CALL].previousValue,
        };
        props = { ...props, ...change[enums.INCOMING_CALL].currentValue };

        if (prevProps.incomingCall !== this.incomingCall && this.incomingCall) {
          this.acceptCall();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit() {
    try {
      this.setLoggedInUser();

      this.attachListeners();
      this.loadAudio();
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy() {
    this.removeListeners();
  }

  attachListeners() {
    try {
      CometChat.addCallListener(
        this.callListenerId,
        new CometChat.CallListener({
          onOutgoingCallAccepted: (call) => {
            this.callScreenUpdated(enums.OUTGOING_CALL_ACCEPTED, call);
          },
          onOutgoingCallRejected: (call) => {
            this.callScreenUpdated(enums.OUTGOING_CALL_REJECTED, call);
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

  callScreenUpdated = (key, call) => {
    try {
      switch (key) {
        case enums.INCOMING_CALL_CANCELLED:
          this.incomingCallCancelled(call);
          break;
        case enums.OUTGOING_CALL_ACCEPTED: 
          this.outgoingCallAccepted(call);
          break;
        case enums.OUTGOING_CALL_REJECTED: 
          this.outgoingCallRejected(call);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
    }
  };

  incomingCallCancelled = (call) => {
    try {
      this.outgoingCallScreen = false;
      this.callInProgress = null;
    } catch (error) {
      console.error(error);
    }
  };

  outgoingCallAccepted = (call) => {
    try {
      if (this.outgoingCallScreen) {
        this.pauseAudio();
        this.outgoingCallScreen = false;
        this.callInProgress = call;

        this.startCall(call);
      }
    } catch (error) {
      console.error(error);
    }
  };

  outgoingCallRejected = (call) => {
    try {
      if (
        call.hasOwnProperty(enums.STATUS) &&
        call.status === CometChat.CALL_STATUS.BUSY
      ) {
        const errorMessage = `${call.sender.name} is on another call.`;
        this.errorScreen = true;
        this.errorMessage = errorMessage;
      } else {
        this.pauseAudio();
        this.actionGenerated.emit({
          type: enums.OUT_GOING_CALL_REJECTED,
          payLoad: call,
        });
        this.outgoingCallScreen = false;
        this.callInProgress = null;
      }
    } catch (error) {
      console.error(error);
    }
  };

 
  startCall(call) {
    try {
      const el = this.callScreenFrame.nativeElement;

      const sessionId = call.getSessionId();
      const callType = call.type;

      const callSettings = new CometChat.CallSettingsBuilder()
        .setSessionID(sessionId)
        .enableDefaultLayout(true)
        .setMode(CometChat.CALL_MODE.DEFAULT)
        .setIsAudioOnlyCall(
          callType === CometChat.CALL_TYPE.AUDIO ? true : false
        )
        .build();

      CometChat.startCall(
        callSettings,
        el,
        new CometChat.OngoingCallListener({
          onUserJoined: (user) => {
            if (
              call.callInitiator.uid !== this.loggedInUser.uid &&
              call.callInitiator.uid !== user.uid
            ) {
              this.markMessageAsRead(call);

              const callMessage = {
                category: call.category,
                type: call.type,
                action: call.action,
                status: call.status,
                callInitiator: call.callInitiator,
                callReceiver: call.callReceiver,
                receiverId: call.receiverId,
                receiverType: call.receiverType,
                sentAt: call.sentAt,
                sender: { ...user },
              };
              this.actionGenerated.emit({
                type: enums.USER_JOINED_CALL,
                payLoad: callMessage,
              });
            }
          },
          onUserLeft: (user) => {
            if (
              call.callInitiator.uid !== this.loggedInUser.uid &&
              call.callInitiator.uid !== user.uid
            ) {
              this.markMessageAsRead(call);

              const callMessage = {
                category: call.category,
                type: call.type,
                action: enums.LEFT,
                status: call.status,
                callInitiator: call.callInitiator,
                callReceiver: call.callReceiver,
                receiverId: call.receiverId,
                receiverType: call.receiverType,
                sentAt: call.sentAt,
                sender: { ...user },
              };

              this.actionGenerated.emit({
                type: enums.USER_LEFT_CALL,
                payLoad: callMessage,
              });
            }
          },
          onCallEnded: (endedCall) => {

            this.outgoingCallScreen = false;
            this.callInProgress = null;

            this.markMessageAsRead(endedCall);
            this.actionGenerated.emit({
              type: enums.CALL_ENDED_BY_USER,
              payLoad: endedCall,
            });
          },
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  markMessageAsRead = (message) => {
    try {
      const type = message.receiverType;
      const id =
        type === CometChat.RECEIVER_TYPE.USER
          ? message.sender.uid
          : message.receiverId;

      if (message.hasOwnProperty(enums.READ_AT) === false) {
        CometChat.markAsRead(message.id, id, type);
      }
    } catch (error) {
      console.error(error);
    }
  };

  acceptCall() {
    try {
      ChatCallManager.acceptCall(this.incomingCall.sessionId)
        .then((call) => {
          this.actionGenerated.emit({
            type: enums.ACCEPTED_INCOMING_CALL,
            payLoad: call,
          });

          this.outgoingCallScreen = false;
          this.callInProgress = call;
          this.errorScreen = false;
          this.errorMessage = null;
          setTimeout(() => {
            this.startCall(call);
          }, 1000);
        })
        .catch((error) => {
          console.error("[CallScreen] acceptCall -- error", error);
          this.actionGenerated.emit({ type: enums.CALL_ERROR, payLoad: error });
        });
    } catch (error) {
      console.error(error);
    }
  }

  cancelCall = () => {
    try {
      this.pauseAudio();
      ChatCallManager.rejectCall(
        this.callInProgress.sessionId,
        CometChat.CALL_STATUS.CANCELLED
      )
        .then((call) => {
          this.actionGenerated.emit({
            type: enums.OUTGOING_CALL_CANCELLED,
            payLoad: call,
          });
          this.outgoingCallScreen = false;
          this.callInProgress = null;
        })
        .catch((error) => {
          this.actionGenerated.emit({ type: enums.CALL_ERROR, payLoad: error });
          this.outgoingCallScreen = false;
          this.callInProgress = null;
        });
    } catch (error) {
      console.error(error);
    }
  };

  setLoggedInUser() {
    try {
      CometChat.getLoggedinUser()
        .then((user) => {
          this.loggedInUser = user;
        })
        .catch((error) => {
          console.error("failed to get the loggedIn user", error);
        });
    } catch (error) {
      console.error(error);
    }
  }

  loadAudio() {
    try {
      this.audio = new Audio();
      this.audio.src = "../../../../../assets/media/outCall.wav";
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
