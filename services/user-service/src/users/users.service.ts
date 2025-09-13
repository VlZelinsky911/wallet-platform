import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { User as UserType } from './user.types';
import { CreateUserInput, UpdateUserInput } from './user.inputs';
import { RabbitMQService } from '../messaging/rabbitmq.service';
import {
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
} from './user.events';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<UserType> {
    try {
      const existingUser = await this.userModel.findOne({
        email: createUserInput.email,
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const createdUser = new this.userModel(createUserInput);
      const savedUser = await createdUser.save();

      // Publish user.created event
      const event: UserCreatedEvent = {
        type: 'user.created',
        occurredAt: new Date(),
        data: {
          userId: (savedUser._id as string).toString(),
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          phone: savedUser.phone,
        },
        version: '1.0',
      };

      await this.rabbitMQService.publishUserCreated(event);

      return this.mapToDTO(savedUser);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<UserType[]> {
    const users = await this.userModel.find({ isActive: true }).exec();
    return users.map((user) => this.mapToDTO(user));
  }

  async findOne(id: string): Promise<UserType> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.mapToDTO(user);
  }

  async findByEmail(email: string): Promise<UserType | null> {
    const user = await this.userModel.findOne({ email, isActive: true }).exec();
    return user ? this.mapToDTO(user) : null;
  }

  async update(updateUserInput: UpdateUserInput): Promise<UserType> {
    const { id, ...updateData } = updateUserInput;

    // Check if email is being updated and if it conflicts
    if (updateData.email) {
      const existingUser = await this.userModel.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Publish user.updated event
    const event: UserUpdatedEvent = {
      type: 'user.updated',
      occurredAt: new Date(),
      data: {
        userId: (user._id as string).toString(),
        ...updateData,
      },
      version: '1.0',
    };

    await this.rabbitMQService.publishUserUpdated(event);

    return this.mapToDTO(user);
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Publish user.deleted event
    const event: UserDeletedEvent = {
      type: 'user.deleted',
      occurredAt: new Date(),
      data: {
        userId: (user._id as string).toString(),
      },
      version: '1.0',
    };

    await this.rabbitMQService.publishUserDeleted(event);

    return true;
  }

  private mapToDTO(user: UserDocument): UserType {
    return {
      id: (user._id as string).toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
