import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  SimpleChanges,
} from "@angular/core";
import * as enums from "../../../utils/enums";

@Component({
  selector: 'app-chat-area',
  templateUrl: './chat-area.component.html',
  styleUrls: ['./chat-area.component.css']
})
export class ChatAreaComponent implements OnInit {
  @ViewChild("messageWindow", { static: false }) chatWindow: ElementRef;

  @Input() item = null;
  @Input() type = null;
  @Input() groupMessage = null;
  @Input() callMessage = null;

  @Output() actionGenerated: EventEmitter<any> = new EventEmitter();

  messageList = [];
  scrollToBottom: true;
  changeNumber = 0;
  reachedTopOfConversation = false;
  scrollVariable = 0;
  messageToReact = null;

  constructor() {}

  ngOnChanges(change: SimpleChanges) {
    try {
 

      if (change[enums.GROUP_MESSAGE]) {
        if (change[enums.GROUP_MESSAGE].currentValue.length > 0) {
          this.appendMessage(change[enums.GROUP_MESSAGE].currentValue);
        }
      }

      if (change[enums.CALL_MESSAGE]) {
        let prevProps = { callMessage: null };
        let props = { callMessage: null };

        prevProps[enums.CALL_MESSAGE] =
          change[enums.CALL_MESSAGE].previousValue;
        props[enums.CALL_MESSAGE] = change[enums.CALL_MESSAGE].currentValue;

        if (prevProps.callMessage !== props.callMessage && props.callMessage) {
          this.actionHandler({
            type: enums.CALL_UPDATED,
            payLoad: change[enums.CALL_MESSAGE].currentValue,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit() {}

  actionHandler(action) {
    try {
      let messages = action.payLoad;

      let data = action.payLoad;

      switch (action.type) {
        case enums.MESSAGE_RECEIVED: {
          const message = messages[0];
        
            setTimeout(() => {
              this.scrollToBottomOfChatWindow();
            }, 2500);

            this.appendMessage(messages);
        

          this.playAudio();

          break;
        }

        case enums.MESSAGE_FETCHED: {
          this.prependMessages(messages);
          break;
        }
        case enums.OLDER_MESSAGES_FETCHED: {
          this.reachedTopOfConversation = false;
          if (messages.length == 0) break;

          let prevScrollHeight = this.chatWindow.nativeElement.scrollHeight;

          this.prependMessages(messages);

          setTimeout(() => {
            this.chatWindow.nativeElement.scrollTop =
              this.chatWindow.nativeElement.scrollHeight - prevScrollHeight;
          });

          break;
        }
        case enums.MESSAGE_COMPOSED: {
          this.appendMessage(messages);
          this.actionGenerated.emit({
            type: enums.MESSAGE_COMPOSED,
            payLoad: messages,
          });
          break;
        }
        case enums.NEW_CONVERSATION_OPENED: {
          this.setMessages(messages);

          break;
        }
        case enums.AUDIO_CALL:
        case enums.VIDEO_CALL:{
          this.actionGenerated.emit(action);
          break;
        }
        case enums.MESSAGE_UPDATED: {
          this.updateMessages(messages);
          break;
        }
        case enums.GROUP_UPDATED:
          this.groupUpdated(data.message, data.key, data.group, data.options);
          break;
        case enums.CALL_UPDATED: {
          this.callUpdated(messages);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  setMessages(messages) {
    try {
      this.messageList = [...messages];

      this.scrollToBottomOfChatWindow();
    } catch (error) {
      console.error(error);
    }
  }

  prependMessages(messages) {
    try {
      this.messageList = [...messages, ...this.messageList];
    } catch (error) {
      console.error(error);
    }
  }

  appendMessage(messages) {
    try {
      let dummy = [...this.messageList];

      this.messageList = [...dummy, ...messages];

      this.scrollToBottomOfChatWindow();
    } catch (error) {
      console.error(error);
    }
  }

  updateMessages = (messages) => {
    try {
      this.messageList = [...messages];
    } catch (error) {
      console.error(error);
    }
  };

  handleScroll(e) {
    try {
      const bottom =
        Math.round(e.currentTarget.scrollHeight - e.currentTarget.scrollTop) ===
        Math.round(e.currentTarget.clientHeight);

      const top = e.currentTarget.scrollTop === 0;

      if (top) {
        this.reachedTopOfConversation = top;
      }
    } catch (error) {
      console.error(error);
    }
  }

  scrollToBottomOfChatWindow() {
    try {
      setTimeout(() => {
        this.chatWindow.nativeElement.scrollTop =
          this.chatWindow.nativeElement.scrollHeight -
          this.chatWindow.nativeElement.clientHeight;
      });
    } catch (error) {
      console.error(error);
    }
  }

  callUpdated(message) {
    try {
      this.appendMessage([message]);
    } catch (error) {
      console.error(error);
    }
  }

  playAudio() {
    try {
      let audio = new Audio();
      audio.src = "../../../../assets/media/incomMess.wav";
      audio.play();
    } catch (error) {
      console.error(error);
    }
  }

  groupUpdated = (message, key, group, options) => {
    try {
      this.appendMessage([message]);

      this.actionGenerated.emit({
        type: enums.GROUP_UPDATED,
        payLoad: { message, key, group, options },
      });
    } catch (error) {
      console.error(error);
    }
  };
}
