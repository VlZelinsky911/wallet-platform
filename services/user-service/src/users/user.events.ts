export interface UserCreatedEvent {
  type: 'user.created';
  occurredAt: Date;
  data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  version: '1.0';
}

export interface UserUpdatedEvent {
  type: 'user.updated';
  occurredAt: Date;
  data: {
    userId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isActive?: boolean;
  };
  version: '1.0';
}

export interface UserDeletedEvent {
  type: 'user.deleted';
  occurredAt: Date;
  data: {
    userId: string;
  };
  version: '1.0';
}
