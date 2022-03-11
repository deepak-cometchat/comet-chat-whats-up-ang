import { CometChat } from "@cometchat-pro/chat";

export class ChatCallManager {
  
  static rejectCall(sessionId, rejectStatus) {
    try {
      let promise = new Promise((resolve, reject) => {
        CometChat.rejectCall(sessionId, rejectStatus).then(
          (call) => resolve(call),
          (error) => reject(error)
        );
      });

      return promise;
    } catch (error) {
      console.error(error);
    }
  }

  static call(receiverID, receiverType, callType) {
    try {
      let promise = new Promise((resolve, reject) => {
        const call = new CometChat.Call(receiverID, callType, receiverType);
        CometChat.initiateCall(call).then(
          (call) => resolve(call),
          (error) => reject(error)
        );
      });

      return promise;
    } catch (error) {
      console.error(error);
    }
  }

  static acceptCall(sessionId) {
    try {
      let promise = new Promise((resolve, reject) => {
        CometChat.acceptCall(sessionId).then(
          (call) => resolve(call),
          (error) => reject(error)
        );
      });

      return promise;
    } catch (error) {
      console.error(error);
    }
  }
}

export default ChatCallManager;
