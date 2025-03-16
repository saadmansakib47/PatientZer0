// src/components/Notification.js
import React from 'react';

const Notification = ({ message, onAccept }) => {
    return (
        <div style={{ background: 'yellow', padding: '10px', position: 'fixed', top: '10px', right: '10px' }}>
            <span>{message}</span>
            <button onClick={onAccept}>Accept</button>
        </div>
    );
};

export default Notification;