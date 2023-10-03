import { io } from "socket.io-client";
import { ChatEvent } from "../messages/event";
import { BaseMessage, ChatMessage } from "../messages/message";

export interface HandlerMethods {
    newChatMessageListener: any,
    typingListener: any,
    usersListener: any,
    newChatListener: any
}

export default class Client {

    socket: any;
    handlers: HandlerMethods;

    constructor(handlers: HandlerMethods) {
        this.handlers = handlers;
    }

    public startChat() {
        this.socket = io("http://localhost:8080");
        console.info(this.socket);
        this.socket.on(ChatEvent.chatMessage.toString(), this.handlers.newChatMessageListener);
        this.socket.on(ChatEvent.typing.toString(), this.handlers.typingListener);
        this.socket.on(ChatEvent.typing.toString(), this.handlers.usersListener);
        this.socket.on(ChatEvent.greeting.toString(), this.handlers.newChatListener);
    }

    public leaveChat() {
        this.socket.close();
    }

    sendMessage(event: ChatEvent, message: BaseMessage) {
        this.socket.emit(event.toString(), message);
    }

    public sendNewUser(name: string) {
        let msg: BaseMessage = {
            sender: name
        };
        this.sendMessage(ChatEvent.newUser, msg);
    }

    public sendIsTyping(name: string) {
        let msg: BaseMessage = {
            sender: name
        };
        this.sendMessage(ChatEvent.typing, msg);
    }

    public sendChatMessage(text: string, name: string) {
        let msg: ChatMessage = {
            message: text,
            sender: name
        };
        this.sendMessage(ChatEvent.chatMessage, msg);
    }

}
