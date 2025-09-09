import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserDoc } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).lean<UserDoc>();
  }

  async createUser(email: string, passwordHash: string, name?: string) {
    const doc = await this.userModel.create({
      email,
      passwordHash,
      name,
      roles: ['user'],
    });
    return doc.toObject() as unknown as UserDoc;
  }
}
