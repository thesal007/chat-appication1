import { User } from '../models/user.model';

export class UserRepository {
  public async updateUserStatus(username: string, online: boolean): Promise<void> {
    await User.findOneAndUpdate({ username }, { online }, { new: true, upsert: true }).exec();
  }

  public async getActiveUsers(): Promise<string[]> {
    const users = await User.find({ online: true }).select('username').exec();
    return users.map(user => user.username);
  }
}
