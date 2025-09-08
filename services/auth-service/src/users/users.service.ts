import { Injectable } from '@nestjs/common';
import { UserModel, UserDoc } from './user.schema';
@Injectable()
export class UsersService {
  findByEmail(email: string) {
    return UserModel.findOne({ email }).lean<UserDoc>();
  }
  async createUser(email: string, passwordHash: string, name?: string) {
    const doc = await UserModel.create({
      email,
      passwordHash,
      name,
      roles: ['user'],
    });
    return doc.toObject() as UserDoc;
  }
}
