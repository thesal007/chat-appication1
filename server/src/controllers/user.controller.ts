import { Controller, Post, Get, Route, Body } from 'tsoa';
import { UserService } from '../services/user.service';

@Route('users')
export class UserController extends Controller {
  private userService = new UserService();

  @Post('status')
  public async updateStatus(
    @Body() requestBody: { username: string; online: boolean }
  ): Promise<void> {
    await this.userService.updateUserStatus(requestBody.username, requestBody.online);
  }

  @Get('active')
  public async getActiveUsers(): Promise<string[]> {
    return this.userService.getActiveUsers();
  }
}
