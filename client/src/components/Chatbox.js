import React, { useState } from 'react';
import './Chatbox.css';

const Chatbox = () => {
    const [message, setMessage] = useState(""); // To store the user's message
    const [chatHistory, setChatHistory] = useState([]); // To store the conversation history
    const [isApiAvailable, setIsApiAvailable] = useState(true); // To track if API is available

    // Function to check if the API is available
    const checkApiAvailability = async () => {
        try {
            const response = await fetch("https://apollo-api-wmzs.onrender.com/api/chat", { method: "GET" });
            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error("API is not available:", error);
            return false;
        }
    };

    // Function to handle sending a message
    const handleSendMessage = async () => {
        if (message) {
            console.log("Message sent:", message);
            
            // Add the user's message to the chat history
            setChatHistory(prevHistory => [
                ...prevHistory,
                { role: "user", message: message }
            ]);

            // Check if the API is available
            const apiAvailable = await checkApiAvailability();
            setIsApiAvailable(apiAvailable);

            let botResponse;

            if (apiAvailable) {
                // Call the real API if it's available
                try {
                    const response = await fetch("https://apollo-api-wmzs.onrender.com/api/chat", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ message: message })
                    });
                    
                    const data = await response.json();
                    botResponse = data.response || "Sorry, I couldn't understand that.";
                } catch (error) {
                    console.error("Error sending message to API:", error);
                    botResponse = "Sorry, there was an error with the chatbot. Please try again later.";
                }
            } else {
                // Use mock response if API is not available
                botResponse = "I'm a health assistant. How can I help you with your health questions?";
            }

            // Add the bot's response to the chat history
            setChatHistory(prevHistory => [
                ...prevHistory,
                { role: "bot", message: botResponse }
            ]);

            setMessage(""); // Clear the input after sending
        }
    };

    return (
        <div className="chatbox">
            <div className="chat-history">
                {/* Render chat history */}
                {chatHistory.map((chat, index) => (
                    <div key={index} className={`chat-message ${chat.role}`}>
                        <p>{chat.message}</p>
                    </div>
                ))}
            </div>
            
            <div className="chat-input">
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="Type your message..." 
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>

            {/* Show an error if API is not available */}
            {!isApiAvailable && (
                <div className="error-message">
                    <p>API is currently unavailable, using mock data.</p>
                </div>
            )}
        </div>
    );
};

export default Chatbox;