import { Router } from 'express';
import ChatController from './chat-controller';
import ChatService from './chat-service';
import { authMiddleware } from '../middlewares/auth-middleware';

const chatRouter = Router();
const chatService = new ChatService();
const chatController = new ChatController(chatService);

chatRouter.use(authMiddleware); 

chatRouter.post('/create', chatController.createChat);
chatRouter.get('/:chatId', chatController.getChat);
chatRouter.get('/user/:userId', chatController.getChatsByUser);
chatRouter.get('/:chatId/messages', chatController.getMessages);


export default chatRouter;
