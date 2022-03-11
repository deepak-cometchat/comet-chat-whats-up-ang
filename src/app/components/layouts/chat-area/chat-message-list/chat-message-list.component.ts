import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectorRef,
} from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import * as enums from "../../../../utils/enums";
import { DatePipe } from "@angular/common";
import { CONSTANTS } from "../../../../utils/constants";

@Component({
  selector: "chat-message-list",
  templateUrl: "./chat-message-list.component.html",
  styleUrls: ["./chat-message-list.component.css"],
})
export class ChatMessageListComponent
  implements OnInit, OnDestroy, OnChanges {
  @Input() item = null;
  @Input() type = null;

  @Input() messages = [];
  @Input() reachedTopOfConversation = [];

  @Output() actionGenerated: EventEmitter<any> = new EventEmitter();

  messagesRequest;
  limit = 50;
  decoratorMessage = CONSTANTS.LOADING_MESSSAGE;
  times = 0;
  lastScrollTop = 0;
  loggedInUser;
  msgListenerId = enums.MESSAGE_ + new Date().getTime();
  groupListenerId = enums.GROUP_ + new Date().getTime();
  callListenerId = enums.CALL_ + new Date().getTime();
  prevUser;

  MESSAGE_TYPE_TEXT: String = CometChat.MESSAGE_TYPE.TEXT;
  MESSAGE_TYPE_VIDEO: String = CometChat.MESSAGE_TYPE.VIDEO;
  MESSAGE_TYPE_AUDIO: String = CometChat.MESSAGE_TYPE.AUDIO;
  CALL_TYPE_AUDIO: String = CometChat.CALL_TYPE.AUDIO;
  CALL_TYPE_VIDEO: String = CometChat.CALL_TYPE.VIDEO;
  CATEGORY_MESSAGE: String = CometChat.CATEGORY_MESSAGE;
  CATEGORY_ACTION: String = CometChat.CATEGORY_ACTION;
  CATEGORY_CALL: String = CometChat.CATEGORY_CALL;

  categories = [
    CometChat.CATEGORY_MESSAGE,
    CometChat.MESSAGE_TYPE.CUSTOM,
    CometChat.CATEGORY_ACTION,
    CometChat.CATEGORY_CALL,
  ];
  types = [
    CometChat.MESSAGE_TYPE.TEXT,
    CometChat.MESSAGE_TYPE.VIDEO,
    CometChat.MESSAGE_TYPE.AUDIO,
    CometChat.CALL_TYPE.AUDIO,
    CometChat.CALL_TYPE.VIDEO,
  ];

  constructor(private ref: ChangeDetectorRef, public datepipe: DatePipe) {
    try {
      setInterval(() => {
        if (!this.ref[enums.DESTROYED]) {
          this.ref.detectChanges();
        }
      }, 2500);
    } catch (error) {
      console.error(error);
    }
  }

  ngOnChanges(change: SimpleChanges) {
    try {
      if (change[enums.ITEM]) {
        CometChat.removeMessageListener(this.msgListenerId);
        CometChat.removeGroupListener(this.groupListenerId);
        CometChat.removeCallListener(this.callListenerId);

        this.msgListenerId = enums.MESSAGE_ + new Date().getTime();
        this.groupListenerId = enums.GROUP_ + new Date().getTime();
        this.callListenerId = enums.CALL_ + new Date().getTime();

        this.createMessageRequestObjectAndGetMessages();

        this.addMessageEventListeners();
      }

      if (change[enums.REACHED_TOP_OF_CONVERSATION]) {
        if (change[enums.REACHED_TOP_OF_CONVERSATION].currentValue) {
          this.getMessages(false, false, true);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit() {
    try {
      this.createMessageRequestObjectAndGetMessages();

      this.addMessageEventListeners();
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy() {
    try {
      CometChat.removeMessageListener(this.msgListenerId);
      CometChat.removeGroupListener(this.groupListenerId);
      CometChat.removeCallListener(this.callListenerId);
    } catch (error) {
      console.error(error);
    }
  }

  createMessageRequestObjectAndGetMessages() {
    try {
        this.messagesRequest = this.buildMessageRequestObject(
          this.item,
          this.type
        );

      this.getMessages(false, true);
    } catch (error) {
      console.error(error);
    }
  }

  addMessageEventListeners() {
    try {
      CometChat.addMessageListener(
        this.msgListenerId,
        new CometChat.MessageListener({
          onTextMessageReceived: (textMessage) => {
            this.messageUpdated(enums.TEXT_MESSAGE_RECEIVED, textMessage);
          },
          onMessagesDelivered: (messageReceipt) => {
            this.messageUpdated(enums.MESSAGE_DELIVERED, messageReceipt);
          },
          onMessagesRead: (messageReceipt) => {
            this.messageUpdated(enums.MESSAGE_READ, messageReceipt);
          },
        })
      );

      CometChat.addGroupListener(
        this.groupListenerId,
        new CometChat.GroupListener({
          onGroupMemberJoined: (message, joinedUser, joinedGroup) => {
            this.messageUpdated(
              enums.GROUP_MEMBER_JOINED,
              message,
              joinedGroup,
              {
                user: joinedUser,
              }
            );
          },
        })
      );

      CometChat.addCallListener(
        this.callListenerId,
        new CometChat.CallListener({
          onIncomingCallReceived: (call) => {
            this.messageUpdated(enums.INCOMING_CALL_RECEIVED, call);
          },
          onIncomingCallCancelled: (call) => {
            this.messageUpdated(enums.INCOMING_CALL_CANCELLED, call);
          },
          onOutgoingCallAccepted: (call) => {
            this.messageUpdated(enums.OUTGOING_CALL_ACCEPTED, call);
          },
          onOutgoingCallRejected: (call) => {
            this.messageUpdated(enums.OUTGOING_CALL_REJECTED, call);
          },
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  buildMessageRequestObject(item = null, type = null, parentMessageId = null) {
    try {
      let messageRequestBuilt;

      if (type === CometChat.RECEIVER_TYPE.USER) {
        if (parentMessageId) {
          messageRequestBuilt = new CometChat.MessagesRequestBuilder()
            .setUID(item.uid)
            .setParentMessageId(parentMessageId)
            .setCategories(this.categories)
            .setTypes(this.types)
            .setLimit(this.limit)
            .build();
        } else {
          messageRequestBuilt = new CometChat.MessagesRequestBuilder()
            .setUID(item.uid)
            .setCategories(this.categories)
            .setTypes(this.types)
            .hideReplies(true)
            .setLimit(this.limit)
            .build();
        }
      } else if (type === CometChat.RECEIVER_TYPE.GROUP) {
        if (parentMessageId) {
          messageRequestBuilt = new CometChat.MessagesRequestBuilder()
            .setGUID(item.guid)
            .setParentMessageId(parentMessageId)
            .setCategories(this.categories)
            .setTypes(this.types)
            .setLimit(this.limit)
            .build();
        } else {
          messageRequestBuilt = new CometChat.MessagesRequestBuilder()
            .setGUID(item.guid)
            .setCategories(this.categories)
            .setTypes(this.types)
            .hideReplies(true)
            .setLimit(this.limit)
            .build();
        }
      }

      return messageRequestBuilt;
    } catch (error) {
      console.error(error);
    }
  }

  getMessages(
    scrollToBottom = false,
    newConversation = false,
    scrollToTop = false
  ) {
    try {
      const actionMessages = [];

      let user = CometChat.getLoggedinUser().then(
        (user) => {
          this.loggedInUser = user;

          this.messagesRequest.fetchPrevious().then(
            (messageList) => {
              

              messageList.forEach((message) => {
                if (
                  message.category === CometChat.CATEGORY_ACTION &&
                  message.sender.uid === enums.APP_SYSTEM
                ) {
                  actionMessages.push(message);
                }

                if (
                  message.getSender().getUid() !== user.getUid() &&
                  !message.getReadAt()
                ) {
                  if (
                    message.getReceiverType() === CometChat.RECEIVER_TYPE.USER
                  ) {
                    CometChat.markAsRead(
                      message.getId().toString(),
                      message.getSender().getUid(),
                      message.getReceiverType(),
                      message.getSender().getUid()
                    );
                  } else if (
                    message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP
                  ) {
                    CometChat.markAsRead(
                      message.getId().toString(),
                      message.getReceiverId(),
                      message.getReceiverType(),
                      
                    );
                  }

                  this.actionGenerated.emit({
                    type: enums.MESSAGE__READ,
                    payLoad: message,
                  });
                }
              });

              ++this.times;

              let actionGeneratedType = enums.MESSAGE_FETCHED;
              if (scrollToBottom === true) {
                actionGeneratedType = enums.MESSAGE_FETCHED_AGAIN;
              }

              if (scrollToTop) {
                actionGeneratedType = enums.OLDER_MESSAGES_FETCHED;
              }
              if (newConversation) {
                actionGeneratedType = enums.NEW_CONVERSATION_OPENED;
              }

              if (
                (this.times === 1 && actionMessages.length > 5) ||
                (this.times > 1 && actionMessages.length === 30)
              ) {
                this.actionGenerated.emit({
                  type: enums.MESSAGE_FETCHED,
                  payLoad: messageList,
                });
                this.getMessages(true, false);
              } else {
                this.actionGenerated.emit({
                  type: actionGeneratedType,
                  payLoad: messageList,
                });
              }
            },
            (error) => {
              console.error(error);
            }
          );
        },
        (error) => {
          console.error(error);
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  messageUpdated(key = null, message = null, group = null, options = null) {
    try {
      switch (key) {
        case enums.TEXT_MESSAGE_RECEIVED:
          this.messageReceived(message);
          break;
        case enums.MESSAGE_DELIVERED:
        case enums.MESSAGE_READ:
          this.messageReadAndDelivered(message);
          break;
        case enums.INCOMING_CALL_RECEIVED:
        case enums.INCOMING_CALL_CANCELLED:
        case enums.OUTGOING_CALL_ACCEPTED:
        case enums.OUTGOING_CALL_REJECTED:
          this.callUpdated(message);
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }

  messageReceived(message) {
    try {
      if (
        this.type === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverId() === this.item.guid
      ) {
        if (!message.getReadAt()) {
          CometChat.markAsRead(
            message.getId().toString(),
            message.getReceiverId(),
            message.getReceiverType()
          );
        }

        this.actionGenerated.emit({
          type: enums.MESSAGE_RECEIVED,
          payLoad: [message],
        });
      } else if (
        this.type === CometChat.RECEIVER_TYPE.USER &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
        message.getSender().uid === this.item.uid
      ) {
        if (!message.getReadAt()) {
          CometChat.markAsRead(
            message.getId().toString(),
            message.getSender().uid,
            message.getReceiverType()
          );
        }

        this.actionGenerated.emit({
          type: enums.MESSAGE_RECEIVED,
          payLoad: [message],
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  actionHandler(action) {
    try {
      this.actionGenerated.emit(action);
    } catch (error) {
      console.error(error);
    }
  }

  messageReadAndDelivered(message) {
    try {
      if (
        message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
        message.getSender().getUid() === this.item.uid &&
        message.getReceiver() === this.loggedInUser.uid
      ) {
        let messageList = [...this.messages];

        if (message.getReceiptType() === enums.DELIVERY) {
          let messageKey = messageList.findIndex(
            (m) => m.id === message.messageId
          );

          if (messageKey > -1) {
            let messageObj = { ...messageList[messageKey] };
            let newMessageObj = Object.assign({}, messageObj, {
              deliveredAt: message.getDeliveredAt(),
            });
            messageList.splice(messageKey, 1, newMessageObj);

            this.actionGenerated.emit({
              type: enums.MESSAGE_UPDATED,
              payLoad: messageList,
            });
          }
        } else if (message.getReceiptType() === enums.READ) {
          let messageKey = messageList.findIndex(
            (m) => m.id === message.messageId
          );

          if (messageKey > -1) {
            let messageObj = { ...messageList[messageKey] };
            let newMessageObj = Object.assign({}, messageObj, {
              readAt: message.getReadAt(),
            });
            messageList.splice(messageKey, 1, newMessageObj);

            this.actionGenerated.emit({
              type: enums.MESSAGE_UPDATED,
              payLoad: messageList,
            });
          }
        }
      } else if (
        message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiver().guid === this.item.guid
      ) {
      }
    } catch (error) {
      console.error(error);
    }
  }


  callUpdated(message) {
    try {
      if (
        this.type === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverId() === this.item.guid
      ) {
        if (!message.getReadAt()) {
          CometChat.markAsRead(
            message.getId().toString(),
            message.getReceiverId(),
            message.getReceiverType()
          );
        }

        this.actionGenerated.emit({
          type: enums.CALL_UPDATED,
          payLoad: message,
        });
      } else if (
        this.type === CometChat.RECEIVER_TYPE.USER &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
        message.getSender().uid === this.item.uid
      ) {
        if (!message.getReadAt()) {
          CometChat.markAsRead(
            message.getId().toString(),
            message.getSender().uid,
            message.getReceiverType()
          );
        }

        this.actionGenerated.emit({
          type: enums.CALL_UPDATED,
          payLoad: message,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  isDateDifferent(firstDate, secondDate) {
    try {
      let firstDateObj: Date, secondDateObj: Date;
      firstDateObj = new Date(firstDate * 1000);
      secondDateObj = new Date(secondDate * 1000);
      if (
        firstDateObj.getDate() === secondDateObj.getDate() &&
        firstDateObj.getMonth() === secondDateObj.getMonth() &&
        firstDateObj.getFullYear() === secondDateObj.getFullYear()
      ) {
        return false;
      }
      return true;
    } catch (error) {
      console.error(error);
    }
  }
}
