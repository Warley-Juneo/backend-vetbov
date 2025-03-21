// src/users/entities/user.entity.ts
import { UserStatus } from '@prisma/client';

export class User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  status: UserStatus;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = new Date();
  }
}
