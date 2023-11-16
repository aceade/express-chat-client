import { io } from "socket.io-client";
import { ChatEvent } from "../messages/event";
import { BaseMessage, ChatMessage, TypingMessage } from "../messages/messages";

export interface HandlerMethods {
    newChatMessageListener: any,
    typingListener: any,
    usersListener: any,
    newChatListener: any,
    errorHandler: any
}

export default class Client {

    socket: any;
    handlers: HandlerMethods;

    constructor(handlers: HandlerMethods, host: string, token: string) {
        this.handlers = handlers;
        this.socket = io(host, {
            auth: {
                token: token
            }
        });
        this.socket.on(ChatEvent.chatMessage, this.handlers.newChatMessageListener);
        this.socket.on(ChatEvent.typing, this.handlers.typingListener);
        this.socket.on(ChatEvent.userList, this.handlers.usersListener);
        this.socket.on(ChatEvent.greeting, this.handlers.newChatListener);
        this.socket.on("connect_error", this.handlers.errorHandler);
    }

    public leaveChat() {
        this.socket.close();
    }

    sendMessage(event: ChatEvent, message: BaseMessage) {
        this.socket.emit(event, message);
    }

    public sendNewUser(name: string) {
        const msg: BaseMessage = {
            sender: name
        };
        this.sendMessage(ChatEvent.newUser, msg);
    }

    public sendIsTyping(name: string) {
        const msg: TypingMessage = {
            sender: name,
            id: this.socket.id
        };
        this.sendMessage(ChatEvent.typing, msg);
    }

    public sendChatMessage(text: string, name: string) {
        const msg: ChatMessage = {
            message: text,
            sender: name
        };
        this.sendMessage(ChatEvent.chatMessage, msg);
        return msg;
    }

}
