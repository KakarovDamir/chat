import { Request, Response } from 'express';
import ChatService from './chat-service';
import { Server } from 'socket.io';
const io = new Server();

class ChatController {
  private chatService: ChatService;

  constructor(chatService: ChatService) {
    this.chatService = chatService;
  }

  createChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { participants } = req.body;
      const chat = await this.chatService.createChat(participants);
      res.status(201).json(chat);
    } catch (err) {
      res.status(500).json({ message: 'Error creating chat' });
    }
  }

  getChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const chat = await this.chatService.getChat(chatId);
      res.status(200).json(chat);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching chat' });
    }
  }

  getChatsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const chats = await this.chatService.getChatsByUser(userId);
      res.status(200).json(chats);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching chats for user' });
    }
  }

  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const { text, userId } = req.body;
      const message = await this.chatService.addMessage(chatId, userId, text);
      res.status(201).json(message);
      io.emit('newMessage', message);
    } catch (err) {
      res.status(500).json({ message: 'Error sending message' });
    }
  }

  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const messages = await this.chatService.fetchMessages(chatId);
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching messages' });
    }
  }
  

}

export default ChatController;
