import { useState } from "react";
import { Greeting, ChatMessage, UserStatusMessage, TypingMessage } from "./messages/message";
import { User } from "./users/user";
import Client from "./chatClient/Client";
import "./Panel.css";

function Panel() {

    const [chatStarted, setChatStarted] = useState(false);

    const [username, setUsername] = useState("");

    const [status, setStatus] = useState("");

    const [userMessage, setUserMessage] = useState("");

    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const [users, setUsers] = useState<User[]>([]);

    const client = new Client({
        newChatListener: (msg: Greeting) => {
            const newUser: User = {
                name: username,
                id: msg.id,
                isTyping: false
            }
            setUsers(users => ([...users, newUser]));
            client.sendNewUser(username);
        },
        newChatMessageListener: (msg: ChatMessage) => {
            setMessages([...messages,msg]);
        },
        typingListener: (msg: TypingMessage) => {
            showStatusMessage(`${msg.sender} is typing...`);
        },
        usersListener: (msg: UserStatusMessage) => {
            showStatusMessage(`${msg.sender} is ${msg.status}`);
            setUsers(msg.users);
        },
    });

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

            setChatStarted(true);
            // client.sendNewUser(username);
        }
        
    }

    const resetPanel = () => {
        client.leaveChat();
        setChatStarted(false);
    }

    const handleNameTyping = (e: { target: { value: any; name: any; }; }) => {
        const {value} = e.target; 
        setUsername(value);
    }

    const onType = (e: { target: { value: any; keycode: any; }; }) => {
        const {value, keycode} = e.target;
        if (keycode === 13) {
            sendMessage();
        } else {
            client.sendIsTyping(username);
            setUserMessage(value);
        }
    }

    const sendMessage = () => {
        console.info("Sending", userMessage);
        client.sendChatMessage(userMessage, username);
        setUserMessage("");
    }

    const buildMessage = (message:ChatMessage) => {
        return (
            <p>{`${message.sender}: ${message.message}`}</p>
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
                <div>
                    <button onClick={resetPanel}>X</button>
                    <div id="messages">
                        {messages.map((message) => buildMessage(message))}
                    </div>
                    <ul id="users">
                        {users.map(user => displayUser(user))}
                    </ul>
                    <div className="controls">
                        <input name="messageInput" id="messageInput" onChange={(e) => onType(e)}></input>
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            }
            </div>
        </>
    )
}

export default Panel;