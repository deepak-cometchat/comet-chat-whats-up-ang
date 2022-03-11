import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import * as enums from "../../../../utils/enums";

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {
  @Input() item = null;
  @Input() type = null;
  @Input() lastMessage;
  @Output() onUserClick: EventEmitter<any> = new EventEmitter();
  loggedInUser = null;
  conversationList = [];
  onItemClick = null;
  selectedConversation = undefined;
  ConversationListManager;
  checkItemChange: boolean = false;

  conversationRequest = null;

  conversationListenerId = enums.CHAT_LIST_ + new Date().getTime();
  userListenerId = enums.CHAT_LIST_USER_ + new Date().getTime();
  groupListenerId = enums.CHAT_LIST_GROUP_ + new Date().getTime();
  callListenerId = enums.CHAT_LIST_CALL_ + new Date().getTime();

  
  constructor(private ref: ChangeDetectorRef) {
    setInterval(() => {
      if (!this.ref[enums.DESTROYED]) {
        this.ref.detectChanges();
      }
    }, 1500);
  }

  ngOnDestroy() {
    try {
      this.removeListeners();
    } catch (error) {
      console.error(error);
    }
  }

  ngOnChanges(change: SimpleChanges) {
    try {
      if (change[enums.ITEM]) {
        this.checkItemChange = true;
        if (
          change[enums.ITEM].previousValue !==
            change[enums.ITEM].currentValue &&
          change[enums.ITEM].currentValue
        ) {
          if (Object.keys(change[enums.ITEM].currentValue).length === 0) {
            this.selectedConversation = {};
          } else {
            const conversationlist = [...this.conversationList];

            const conversationObj = conversationlist.find((c) => {
              if (
                (c.conversationType === this.type &&
                  this.type === CometChat.RECEIVER_TYPE.USER &&
                  c.conversationWith.uid === this.item.uid) ||
                (c.conversationType === this.type &&
                  this.type === CometChat.RECEIVER_TYPE.GROUP &&
                  c.conversationWith.guid === this.item.guid)
              ) {
                return c;
              }
              return false;
            });
            if (conversationObj) {
              let conversationKey = conversationlist.indexOf(conversationObj);
              let newConversationObj = {
                ...conversationObj,
                unreadMessageCount: 0,
              };
              conversationlist.splice(conversationKey, 1, newConversationObj);
              this.conversationList = conversationlist;
              this.selectedConversation = newConversationObj;
            }
          }

          // if user is blocked/unblocked, update conversationlist i.e user is removed from conversationList
          if (
            change[enums.ITEM].previousValue &&
            Object.keys(change[enums.ITEM].previousValue).length &&
            change[enums.ITEM].previousValue.uid ===
              change[enums.ITEM].currentValue.uid &&
            change[enums.ITEM].previousValue.blockedByMe !==
              change[enums.ITEM].currentValue.blockedByMe
          ) {
            let conversationlist = [...this.conversationList];

            //search for user
            let convKey = conversationlist.findIndex(
              (c, k) =>
                c.conversationType === CometChat.RECEIVER_TYPE.USER &&
                c.conversationWith.uid === change[enums.ITEM].currentValue.uid
            );
            if (convKey > -1) {
              conversationlist.splice(convKey, 1);
              this.conversationList = conversationlist;
            }
          }
        }
      }

      if (this.checkItemChange === false) {
        if (change[enums.LAST_MESSAGE]) {
          if (
            change[enums.LAST_MESSAGE].previousValue !==
              change[enums.LAST_MESSAGE].currentValue &&
            change[enums.LAST_MESSAGE].currentValue !== undefined
          ) {
            const lastMessage = change[enums.LAST_MESSAGE].currentValue[0];

            const conversationList = [...this.conversationList];
            const conversationKey = conversationList.findIndex((c) => {
              if (lastMessage === undefined) {
                return false;
              }
              return c.conversationId === lastMessage.conversationId;
            });

            if (conversationKey > -1) {
              const conversationObj = conversationList[conversationKey];
              let newConversationObj = {
                ...conversationObj,
                lastMessage: lastMessage,
              };

              conversationList.splice(conversationKey, 1);
              conversationList.unshift(newConversationObj);
              this.conversationList = conversationList;
            }
          }
        }
      }
      this.checkItemChange = false;
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit() {
    try {
      this.conversationRequest = new CometChat.ConversationsRequestBuilder()
        .setLimit(30)
        .build();
      this.getConversation();
      this.attachListeners(this.conversationUpdated);
    } catch (error) {
      console.error(error);
    }
  }

  fetchNextConversation() {
    try {
      return this.conversationRequest.fetchNext();
    } catch (error) {
      console.error(error);
    }
  }

  attachListeners(callback) {
    try {
      CometChat.addUserListener(
        this.userListenerId,
        new CometChat.UserListener({
          onUserOnline: (onlineUser) => {
            callback(enums.USER_ONLINE, onlineUser);
          },
          onUserOffline: (offlineUser) => {
            callback(enums.USER_OFFLINE, offlineUser);
          },
        })
      );

      CometChat.addGroupListener(
        this.groupListenerId,
        new CometChat.GroupListener({
          onGroupMemberJoined: (message, joinedUser, joinedGroup) => {
            callback(enums.GROUP_MEMBER_JOINED, joinedGroup, message, {
              user: joinedUser,
            });
          },
        })
      );

      CometChat.addMessageListener(
        this.conversationListenerId,
        new CometChat.MessageListener({
          onTextMessageReceived: (textMessage) => {
            callback(enums.TEXT_MESSAGE_RECEIVED, null, textMessage);
          }
        })
      );

      CometChat.addCallListener(
        this.callListenerId,
        new CometChat.CallListener({
          onIncomingCallReceived: (call) => {
            callback(enums.INCOMING_CALL_RECEIVED, null, call);
          },
          onIncomingCallCancelled: (call) => {
            callback(enums.INCOMING_CALL_CANCELLED, null, call);
          },
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  removeListeners() {
    try {
      CometChat.removeMessageListener(this.conversationListenerId);
      CometChat.removeUserListener(this.userListenerId);
      CometChat.removeGroupListener(this.groupListenerId);
      CometChat.removeCallListener(this.callListenerId);
    } catch (error) {
      console.error(error);
    }
  }

  getConversation() {
    try {
      CometChat.getLoggedinUser()
        .then((user) => {
          this.loggedInUser = user;
          this.fetchNextConversation()
            .then((conversationList) => {
              conversationList.forEach((conversation) => {
                if (
                  this.type !== null &&
                  this.item !== null &&
                  this.type === conversation.conversationType
                ) {
                  if (
                    (conversation.conversationType ===
                      CometChat.RECEIVER_TYPE.USER &&
                      this.item.uid === conversation.conversationWith.uid) ||
                    (conversation.conversationType ===
                      CometChat.RECEIVER_TYPE.GROUP &&
                      this.item.guid === conversation.conversationWith.guid)
                  ) {
                    conversation.unreadMessageCount = 0;
                  }
                }
              });
              this.conversationList = [
                ...this.conversationList,
                ...conversationList,
              ];
           
            })
            .catch((error) => {
              console.error(
                error
              );
            });
        })
        .catch((error) => {
          console.error(
            error
          );
        });
    } catch (error) {
      console.error(error);
    }
  }

  conversationUpdated = (
    key = null,
    item = null,
    message = null,
    options = null
  ) => {
    try {
      switch (key) {
        case enums.USER_ONLINE:
        case enums.USER_OFFLINE: {
          this.updateUser(item);
          break;
        }
        case enums.TEXT_MESSAGE_RECEIVED:
          this.updateConversation(message);
          break;
      }
    } catch (error) {
      console.error(error);
    }
  };

  updateUser(user) {
    try {
      const conversationlist = [...this.conversationList];

      const conversationKey = conversationlist.findIndex(
        (conversationObj) =>
          conversationObj.conversationType === CometChat.RECEIVER_TYPE.USER &&
          conversationObj.conversationWith.uid === user.uid
      );
      if (conversationKey > -1) {
        let conversationObj = { ...conversationlist[conversationKey] };
        let conversationWithObj = {
          ...conversationObj.conversationWith,
          status: user.getStatus(),
        };

        let newConversationObj = {
          ...conversationObj,
          conversationWith: conversationWithObj,
        };
        conversationlist.splice(conversationKey, 1, newConversationObj);

        this.conversationList = conversationlist;
      }
    } catch (error) {
      console.error(error);
    }
  }

  makeLastMessage(message, conversation = {}) {
    try {
      const newMessage = Object.assign({}, message);
      return newMessage;
    } catch (error) {
      console.error(error);
    }
  }

  updateConversation(message, notification = true) {
    try {
      this.makeConversation(message)
        .then((response: any) => {
          const conversationKey = response.conversationKey;
          const conversationObj = response.conversationObj;
          const conversationList = response.conversationList;

          if (conversationKey > -1) {
            let unreadMessageCount = this.makeUnreadMessageCount(
              conversationObj
            );
            let lastMessageObj = this.makeLastMessage(message, conversationObj);
            let newConversationObj = {
              ...conversationObj,
              lastMessage: lastMessageObj,
              unreadMessageCount: unreadMessageCount,
            };

            conversationList.splice(conversationKey, 1);
            conversationList.unshift(newConversationObj);
            this.conversationList = conversationList;

            if (notification) {
              this.playAudio();
            }
          } else {
            let unreadMessageCount = this.makeUnreadMessageCount();
            let lastMessageObj = this.makeLastMessage(message);
            let newConversationObj = {
              ...conversationObj,
              lastMessage: lastMessageObj,
              unreadMessageCount: unreadMessageCount,
            };
            conversationList.unshift(newConversationObj);
            this.conversationList = conversationList;

            if (notification) {
              this.playAudio();
            }
          }
        })
        .catch((error) => {
          console.error(
            error
          );
        });
    } catch (error) {
      console.error(error);
    }
  }
  makeUnreadMessageCount(conversation: any = {}, operator = null) {
    try {
      if (Object.keys(conversation).length === 0) {
        return 1;
      }

      let unreadMessageCount = parseInt(conversation.unreadMessageCount);
      if (
        this.selectedConversation &&
        this.selectedConversation.conversationId === conversation.conversationId
      ) {
        unreadMessageCount = 0;
      } else if (
        (this.item &&
          this.item.hasOwnProperty(enums.GUID) &&
          conversation.conversationWith.hasOwnProperty(enums.GUID) &&
          this.item.guid === conversation.conversationWith.guid) ||
        (this.item &&
          this.item.hasOwnProperty(enums.UID) &&
          conversation.conversationWith.hasOwnProperty(enums.UID) &&
          this.item.uid === conversation.conversationWith.uid)
      ) {
        unreadMessageCount = 0;
      } else {
        if (operator && operator === enums.DECREMENT) {
          unreadMessageCount = unreadMessageCount ? unreadMessageCount - 1 : 0;
        } else {
          unreadMessageCount = unreadMessageCount + 1;
        }
      }

      return unreadMessageCount;
    } catch (error) {
      console.error(error);
    }
  }

  makeConversation(message) {
    try {
      const promise = new Promise((resolve, reject) => {
        CometChat.CometChatHelper.getConversationFromMessage(message)
          .then((conversation: any) => {
            let conversationList = [...this.conversationList];
            let conversationKey = conversationList.findIndex(
              (c) => c.conversationId === conversation.conversationId
            );

            let conversationObj = { ...conversation };
            if (conversationKey > -1) {
              conversationObj = { ...conversationList[conversationKey] };
            }

            resolve({
              conversationKey: conversationKey,
              conversationObj: conversationObj,
              conversationList: conversationList,
            });
          })
          .catch((error) => reject(error));
      });
      return promise;
    } catch (error) {
      console.error(error);
    }
  }

  handleScroll(e) {
    try {
      const bottom =
        Math.round(e.currentTarget.scrollHeight - e.currentTarget.scrollTop) ===
        Math.round(e.currentTarget.clientHeight);
      if (bottom) {
        this.getConversation();
      }
    } catch (error) {
      console.error(error);
    }
  }

  userClicked(user) {
    try {
      this.onUserClick.emit(user);
    } catch (error) {
      console.error(error);
    }
  }

  playAudio() {
    try {
      let audio = new Audio();
      audio.src = "../../../../../assets/media/incomMess.wav";
      audio.play();
    } catch (error) {
      console.error(error);
    }
  }

}
