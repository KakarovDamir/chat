'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useUser } from '../../context/UserContext'; // Импортируем хук useEmail

interface Message {
  _id: string;
  text: string;
  sender: string;
  createdAt: string;
}

interface User {
  _id: string;
  email: string;
}

const ChatPage = () => {
  const params = useParams();
  const userId = params.userId as string;

  const { email } = useUser(); // Получаем email из контекста

  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/v1/chat/${userId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchUsers();
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    if (email) {
      const currentSocket = io('http://localhost:5000');
      setSocket(currentSocket);

      currentSocket.emit('joinChat', userId);

      currentSocket.on('message', (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        currentSocket.disconnect();
      };
    }
  }, [userId, email]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    const currentUser = users.find(user => user.email === email);
    if (!currentUser) {
      console.error('Current user not found in users list');
      return;
    }

    const tempMessageId = new Date().toISOString(); // Temporary ID
    const message = { 
      _id: tempMessageId, // Assign a unique ID temporarily
      sender: currentUser._id, 
      text: newMessage, 
      createdAt: new Date().toISOString() 
    };
    
    // Emit the message to the server via WebSocket
    socket.emit('chat message', message);

    // Optimistically add the message to local state
    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage('');

    // Send the message to the server via HTTP to store in DB
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/v1/chats/${userId}/messages`, message, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Replace the temporary ID with the real one from the server
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === tempMessageId ? response.data : msg))
      );
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className='text-black'>
      <h1>Chat with {userId}</h1>
      <div>
        {messages.map((message) => (
          <div key={message._id}>
            <strong>{message.sender}</strong>: {message.text} <em>{new Date(message.createdAt).toLocaleString()}</em>
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;