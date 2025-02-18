// src/components/Chatbox.js
import React, { useState } from "react";
import "./Chatbox.css";

const Chatbox = ({ userRole }) => {
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState("");

  const toggleChat = () => {
    setOpened((prev) => !prev);
  };

  const handleSendMessage = () => {
    if (message) {
      console.log("Message sent:", message);
      setMessage(""); // Clear the input after sending
    }
  };

  return (
    <div
      className={`floating-chat ${
        opened ? "floating-chat-opened" : "floating-chat-closed"
      }`}
    >
      <div className="floating-chat-header" onClick={toggleChat}>
        <div className="floating-chat-text">
          {opened ? "💬 Chat with Us" : "💬 Chat"}
          <span className="close-button">{opened ? "✖" : ""}</span>
        </div>
      </div>
      {opened && (
        <div className="floating-chat-content">
          <div className="chat-message prompt-message">
            <p>Hi! Need assistance? Chat with a health professional now.</p>
            <div className="reply-options">
              <button
                className="reply-option"
                onClick={() => setMessage("Yes")}
              >
                Yes
              </button>
              <button className="reply-option" onClick={() => setMessage("No")}>
                No
              </button>
            </div>
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
