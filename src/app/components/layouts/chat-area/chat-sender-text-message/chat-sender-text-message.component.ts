import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "chat-sender-text-message",
  templateUrl: "./chat-sender-text-message.component.html",
  styleUrls: ["./chat-sender-text-message.component.css"],
})
export class ChatSenderTextMessageComponent implements OnInit {
  @Input() messageDetails = null;

  constructor() {}

  ngOnInit() {
 
  }

}
