import { UserRepository } from '../repositories/user.repository';

export class UserService {
  private userRepository = new UserRepository();

  public async updateUserStatus(username: string, online: boolean): Promise<void> {
    await this.userRepository.updateUserStatus(username, online);
  }

  public async getActiveUsers(): Promise<string[]> {
    return this.userRepository.getActiveUsers();
  }
}
