import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import * as enums from "../../../../utils/enums";

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { CONSTANTS } from "../../../../utils/constants";
@Component({
  selector: "chat-message-inputarea",
  templateUrl: "./chat-message-inputarea.component.html",
  styleUrls: ["./chat-message-inputarea.component.css"],
})
export class ChatMessageInputareaComponent implements OnInit, OnChanges {
  @Input() item = null;
  @Input() type = null;

  @Output() actionGenerated: EventEmitter<any> = new EventEmitter();

  enableSendButton = false;
  messageSending: boolean = false;
  messageInput = "";
  messageType = "";
  isTyping: any;
  ENTER_YOUR_MESSAGE_HERE: String = CONSTANTS.ENTER_YOUR_MESSAGE_HERE;

  constructor() {}

  ngOnChanges(change: SimpleChanges) {

  }

  ngOnInit() {}


  getReceiverDetails() {
    try {
      let receiverId;
      let receiverType;

      if (this.type == CometChat.RECEIVER_TYPE.USER) {
        receiverId = this.item.uid;
        receiverType = CometChat.RECEIVER_TYPE.USER;
      } else if (this.type == CometChat.RECEIVER_TYPE.GROUP) {
        receiverId = this.item.guid;
        receiverType = CometChat.RECEIVER_TYPE.GROUP;
      }

      return { receiverId: receiverId, receiverType: receiverType };
    } catch (error) {
      console.error(error);
    }
  }


  changeHandler(event) {
    try {
      this.startTyping();
      if (event.target.value.length > 0) {
        this.messageInput = event.target.value;
        this.enableSendButton = true;
      }
      if (event.target.value.length == 0) {
        this.enableSendButton = false;
        this.messageInput = "";
      }
    } catch (error) {
      console.error(error);
    }
  }
  sendMessageOnEnter(event) {
    try {
      if (event.keyCode === 13 && !event.shiftKey) {
        event.preventDefault();
        this.sendTextMessage(event.target.value);
        this.playAudio();
      }
    } catch (error) {
      console.error(error);
    }
  }

 
  sendTextMessage(textMsg: String = "") {
    try {
 

      if (this.messageSending) {
        return false;
      }

      this.messageSending = true;


      let { receiverId, receiverType } = this.getReceiverDetails();

      let messageInput;

      if (textMsg !== null) {
        messageInput = textMsg.trim();
      } else {
        messageInput = this.messageInput.trim();
      }

      let textMessage = new CometChat.TextMessage(
        receiverId,
        messageInput,
        receiverType
      );


      this.endTyping();

      CometChat.sendMessage(textMessage)
        .then((message) => {
          this.messageInput = "";
          this.messageSending = false;

          this.actionGenerated.emit({
            type: enums.MESSAGE_COMPOSED,
            payLoad: [message],
          });

          this.messageInput = "";

          setTimeout(() => {
            this.enableSendButton = false;
          }, 500);
        })
        .catch((error) => {
          console.error(error);
          this.messageSending = false;
        });
    } catch (error) {
      console.error(error);
    }
  }

  playAudio() {
    try {
      let audio = new Audio();
      audio.src = "../../../../../assets/media/outMess.wav";
      audio.play();
    } catch (error) {
      console.error(error);
    }
  }

  startTyping(timer = null, metadata = null) {
    try {
      let typingInterval = timer || 5000;

      if (this.isTyping > 0) {
        return false;
      }
      let { receiverId, receiverType } = this.getReceiverDetails();
      let typingMetadata = metadata || undefined;

      let typingNotification = new CometChat.TypingIndicator(
        receiverId,
        receiverType,
        typingMetadata
      );
      CometChat.startTyping(typingNotification);

      this.isTyping = setTimeout(() => {
        this.endTyping();
      }, typingInterval);
    } catch (error) {
      console.error(error);
    }
  }

  endTyping(metadata = null) {
    try {
      let { receiverId, receiverType } = this.getReceiverDetails();

      let typingMetadata = metadata || undefined;

      let typingNotification = new CometChat.TypingIndicator(
        receiverId,
        receiverType,
        typingMetadata
      );
      CometChat.endTyping(typingNotification);

      clearTimeout(this.isTyping);
      this.isTyping = null;
    } catch (error) {
      console.error(error);
    }
  }
}
