import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMessage extends Document {
  text: string;
  sender: mongoose.Types.ObjectId;
  chat: mongoose.Types.ObjectId;
}

const messageSchema: Schema<IMessage> = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);

export default MessageModel;
