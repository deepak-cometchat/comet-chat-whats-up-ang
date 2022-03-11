import { Component, Input, OnInit } from "@angular/core";
import { CONSTANTS } from "../../../../utils/constants";
import * as enums from "../../../../utils/enums";

@Component({
  selector: "chat-read-receipt",
  templateUrl: "./chat-read-receipt.component.html",
  styleUrls: ["./chat-read-receipt.component.css"],
})
export class ChatReadReceiptComponent implements OnInit {
  @Input() messageDetails = null;
  @Input() displayReadReciept = true;

  tickStatus: String;
  time;

  SENT: String = CONSTANTS.SENT;
  DELIVERED: String = CONSTANTS.DELIVERED;
  READ: String = enums.READ;
  constructor() {}

  ngOnInit() {
    try {
      this.getDeliveryStatus();
      this.time = this.getSentAtTime(this.messageDetails);
    } catch (error) {
      console.error(error);
    }
  }

getSentAtTime(message)  {
  try {
    let msgSentAt = message.sentAt;
    msgSentAt = msgSentAt * 1000;

    return msgSentAt;
  } catch (error) {
    console.error(error);
  }
}

  getDeliveryStatus() {
    try {
      if (this.messageDetails.hasOwnProperty(enums.SENT_AT)) {
        this.tickStatus = this.SENT;

        if (this.messageDetails.hasOwnProperty(enums.DELIVERED_AT)) {
          this.tickStatus = this.DELIVERED;
        }
        if (this.messageDetails.hasOwnProperty(enums.READ_AT)) {
          this.tickStatus = this.READ;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
