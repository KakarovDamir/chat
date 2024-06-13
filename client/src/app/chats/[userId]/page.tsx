'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

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
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found');
        }

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
        if (!token) {
          throw new Error('Token not found');
        }

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
      const token = localStorage.getItem('token');
      if (token) {
        const currentSocket = io('http://localhost:5000', {
          auth: { token }
        });
        setSocket(currentSocket);

        currentSocket.emit('register_user', userId);

        currentSocket.on('update_user_list', (onlineUsers: string[]) => {
          setOnlineUsers(onlineUsers);
        });

        currentSocket.on('message', (message: Message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });

        currentSocket.on('typing', (data: { userId: string; typing: boolean }) => {
          if (data.userId === userId) {
            setTyping(data.typing);
          }
        });

        return () => {
          currentSocket.disconnect();
        };
      }
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
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await axios.post(`http://localhost:5000/api/v1/chat/${userId}/messages`, message, {
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

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { userId, typing: true });
      setTimeout(() => {
        socket.emit('typing', { userId, typing: false });
      }, 2000); // Stop typing after 2 seconds of inactivity
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Chat with {userId}</h1>
      <div className='mb-4'>
        {onlineUsers.includes(userId) ? <p className='text-green-500'>{userId} is online</p> : <p className='text-red-500'>{userId} is offline</p>}
        {typing && <p className='text-blue-500'>{userId} is typing...</p>}
      </div>
      <div className='bg-gray-100 p-4 rounded-lg mb-4' >
        {messages.map((message) => (
          <div key={message._id} className='mb-2 text-black' >
            <strong className='block text-black'>{message.sender}</strong>: {message.text} <em className='text-xs text-gray-600'>{new Date(message.createdAt).toLocaleString()}</em>
          </div>
        ))}
      </div>
      <div className='flex items-center'>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleTyping}
          placeholder="Type a message"
          className='flex-1 p-2 border border-gray-300 rounded mr-2'
        />
        <button onClick={handleSendMessage} className='bg-blue-500 text-white px-4 py-2 rounded'>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
