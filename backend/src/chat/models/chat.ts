import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
}

const chatSchema: Schema<IChat> = new Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
});

const ChatModel: Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);

export default ChatModel;
