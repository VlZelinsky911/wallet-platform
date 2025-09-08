import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop()
  name?: string;

  @Prop({ type: [String], default: ['user'] })
  roles!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDoc = {
  _id: string;
  email: string;
  passwordHash: string;
  name?: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
};
