import ChatModel, { IChat } from './models/chat';
import MessageModel, { IMessage } from './models/message';
import mongoose from 'mongoose';

class ChatService {
  static async addMessage(chatId: string, senderId: string, text: string): Promise<IMessage> {
    if (!senderId ) {
      throw new Error('Sender does not exist');
    }
    const message = new MessageModel({text: text, sender: senderId, chat: chatId });
    await message.save();

    return message;
  }
  async createChat(participants: mongoose.Types.ObjectId[]): Promise<IChat> {
    const chat = new ChatModel({ participants });
    await chat.save();
    return chat;
  }

  async getChat(chatId: string): Promise<IChat | null> {
    return await ChatModel.findById(chatId).populate('participants').populate('lastMessage').exec();
  }

  async getChatsByUser(userId: string): Promise<IChat[]> {
    return await ChatModel.find({ participants: userId }).populate('participants').populate('lastMessage').exec();
  }
}

export default ChatService;
