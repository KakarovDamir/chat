import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './db';
import globalRouter from './ global-router';
import { logger } from './logger';
import cors from 'cors';
import ChatService from './chat/chat-service';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

connectDB();

app.use(logger);
app.use(express.json());

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use('/api/v1/', globalRouter);

const io = new SocketIOServer(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    },
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('register_user', (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit('update_user_list', Array.from(onlineUsers.keys()));
        console.log(`${userId} connected`);
    });

    socket.on('disconnect', () => {
        const disconnectedUser = [...onlineUsers.entries()].find(([key, value]) => value === socket.id);
        if (disconnectedUser) {
            const [userId] = disconnectedUser;
            onlineUsers.delete(userId);
            io.emit('update_user_list', Array.from(onlineUsers.keys()));
            console.log(`${userId} disconnected`);
        }
    });

    socket.on('chat message', async (msg) => {
        console.log('message: ', msg);

        const { sender, text, createdAt } = msg;
        try {
            const addMessage = await ChatService.addMessage(sender, msg.receiver, text);
            io.emit('message', addMessage);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('typing', (data) => {
        console.log('typing: ', data);
        io.emit('typing', data);
    });
});

server.listen(PORT, () => {
    console.log(`Server runs at http://localhost:${PORT}`);
});
