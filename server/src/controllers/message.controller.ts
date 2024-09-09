import { Controller, Post, Get, Route, Body, Query } from 'tsoa';
import { MessageService } from '../services/message.service';
import { IMessage } from '../models/message.model';

@Route('messages')
export class MessageController extends Controller {
  private messageService = new MessageService();

  @Post()
  public async sendMessage(
    @Body() requestBody: { from: string; to: string; message: string }
  ): Promise<IMessage> {
    return this.messageService.sendMessage(requestBody.from, requestBody.to, requestBody.message);
  }

  @Get()
  public async getMessages(@Query() userId: string): Promise<IMessage[]> {
    return this.messageService.getMessages(userId);
  }
}
