import { MessageRepository } from '../repositories/message.repository';
import { IMessage } from '../models/message.model';

export class MessageService {
  private messageRepository = new MessageRepository();

  public async sendMessage(from: string, to: string, message: string): Promise<IMessage> {
    const newMessage: IMessage = { from, to, message, timestamp: new Date() };
    return this.messageRepository.save(newMessage);
  }

  public async getMessages(userId: string): Promise<IMessage[]> {
    return this.messageRepository.getMessages(userId);
  }
}
