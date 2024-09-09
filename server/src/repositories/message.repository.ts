import { Message, IMessage } from '../models/message.model';

export class MessageRepository {
  public async save(message: IMessage): Promise<IMessage> {
    const newMessage = new Message(message);
    return newMessage.save();
  }

  public async getMessages(userId: string): Promise<IMessage[]> {
    return Message.find({ $or: [{ from: userId }, { to: userId }] }).exec();
  }
}
