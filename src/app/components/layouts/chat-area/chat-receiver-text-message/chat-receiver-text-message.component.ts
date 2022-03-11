import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";

@Component({
  selector: "chat-receiver-text-message",
  templateUrl: "./chat-receiver-text-message.component.html",
  styleUrls: ["./chat-receiver-text-message.component.css"],
})
export class ChatReceiverTextMessageComponent implements OnInit {
  @Input() type: String = "";
  @Input() messageDetails = null;

  GROUP: String = CometChat.RECEIVER_TYPE.GROUP;

  constructor() {}

  ngOnInit() {

  }
}
