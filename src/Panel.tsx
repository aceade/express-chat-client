import { ChangeEvent, KeyboardEvent, useState } from "react";
import { Greeting, ChatMessage, UserStatusMessage, TypingMessage, DisplayMessage } from "./messages/messages";
import { User } from "./users/user";
import Client from "./chatClient/Client";
import "./Panel.css";
import { fetchToken } from "./token/fetchToken";

function Panel() {

    const [chatStarted, setChatStarted] = useState(false);

    const [username, setUsername] = useState("");

    const [status, setStatus] = useState("");

    const [userMessage, setUserMessage] = useState("");

    const [messages, setMessages] = useState<DisplayMessage[]>([]);

    const [users, setUsers] = useState<User[]>([]);

    const [client, setClient] = useState<Client>();

    const buildClient = async () => {
        let host = process.env.REACT_APP_CHAT_ENDPOINT || "http://localhost:8080";
        const token = await fetchToken(host);
        console.info(token);
        let client = new Client({
            newChatListener: (msg: Greeting) => {
                const newUser: User = {
                    name: username,
                    id: msg.id,
                    isTyping: false
                }
                setUsers(users => ([...users, newUser]));
                showStatusMessage(`You have entered the chat`);
                client.sendNewUser(username);
            },
            newChatMessageListener: (msg: ChatMessage) => {
                appendChatMessage(msg);
            },
            typingListener: (msg: TypingMessage) => {
                showStatusMessage(`${msg.sender} is typing...`);
            },
            usersListener: (msg: UserStatusMessage) => {
                console.info(msg);
                showStatusMessage(`${msg.sender} is ${msg.status}`);
                setUsers(msg.users);
            }, errorHandler: (err: Error) => {
                console.error(err);
                showStatusMessage(`Unable to connect: ${err}`);
                appendChatMessage({
                    message: `Unable to connect! ${err}`,
                    sender: "Server"
                }, true);
            }
        }, host, token);
        setClient(client);
    }

    const appendChatMessage = (msg: ChatMessage, fromMe = false) => {
        let displayMessage: DisplayMessage = {
            message: msg.message,
            sender: msg.sender,
            fromMe: fromMe
        }
        // append using the spread operator
        setMessages(messages => [...messages, displayMessage]);
    }

    const showStatusMessage = (msg: string) => {
        setStatus(msg);
        setTimeout(() => {
            setStatus("");
        }, 2000);
    }

    const startChat = () => {
        if (username.length === 0) {
            showStatusMessage("Please enter your name");
        } else {
            console.log("Yay, this works");
            buildClient();
            setChatStarted(true);
        }
        
    }

    const resetPanel = () => {
        client?.leaveChat();
        setChatStarted(false);
    }

    const handleNameTyping = (e: { target: { value: any; name: any; }; }) => {
        const {value} = e.target; 
        setUsername(value);
    }

    // need separate events for some reason
    const onEnterPressed = (e: KeyboardEvent<HTMLInputElement>) => {
        const {code} = e;
        if (code.toLowerCase() === "enter") {
            sendMessage();
        } 
    }

    const onType = (e: ChangeEvent<HTMLInputElement>) => {
        client?.sendIsTyping(username);
        setUserMessage(e.target.value)
    }

    const sendMessage = () => {
        console.info("Sending", userMessage);
        let msg = client?.sendChatMessage(userMessage, username);
        setUserMessage("");
        if (msg) {
            appendChatMessage(msg, true);
        }

    }

    const buildMessage = (message:DisplayMessage) => {
        return (
            <p className={message.fromMe ? "fromMe" : "fromServer"}>{`${message.sender}: ${message.message}`}</p>
        )
    }

    const displayUser = (user: User) => {
        return (
            <>
                <li key={user.id}>{user.name}</li>
            </>
        )
    }

    return (
        <>
            <div id="wrapper">
            <h2>Chatter</h2>
            {
                !chatStarted &&
                <div className="controls">
                    <label htmlFor="name">Your name</label>
                    <input id="name" name="name" onChange={handleNameTyping}></input>
                    <button onClick={startChat}>Start</button>
                    <p>{status}</p>
                    
                </div>
            }
            {
                chatStarted &&
                <div id="chatPanel">
                    <button onClick={resetPanel}>X</button>
                    <div id="messages">
                        {messages.map((message) => buildMessage(message))}
                    </div>
                    <ul id="users">
                        {users && users.map(user => displayUser(user))}
                    </ul>
                    <p>{status}</p>
                    <div className="controls">
                        <label htmlFor="messageInput">Your message</label>
                        <input name="messageInput" id="messageInput" onChange={(e) => onType(e)} onKeyDown={(e) => onEnterPressed(e)}></input>
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            }
            </div>
        </>
    )
}

export default Panel;