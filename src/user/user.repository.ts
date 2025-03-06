import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/user/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { UserStatus } from '@prisma/client';
@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findAll({
    page,
    limit,
    sort,
    status,
  }: {
    page: number;
    limit: number;
    sort?: string;
    status?: string;
  }): Promise<{ data: User[]; total: number }> {
    const [field, order] = sort?.split(':') || ['id', 'asc'];

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: status ? { status: status as any } : undefined,
        orderBy: { [field]: order.toLowerCase() },
      }),
      this.prisma.user.count({
        where: status ? { status: status as any } : undefined,
      }),
    ]);

    return { data, total };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...userData,
        status: userData.status || UserStatus.ACTIVE,
      },
    });
  }

  async update(email: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { email },
      data: updateUserDto,
    });
  }

  async delete(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: {
        status: UserStatus.INACTIVE,
        deletedAt: new Date(),
      },
    });
  }
}
