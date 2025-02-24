import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { UserStatus } from '@prisma/client';
@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findAll(pagination: { page: number; limit: number }, filters?: any) {
    const result = await this.userRepository.findAll({
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    });

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: pagination.page,
        last_page: Math.ceil(result.total / pagination.limit),
      },
    };
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    if (
      createUserDto.role === 'admin' &&
      createUserDto.status !== UserStatus.ACTIVE
    ) {
      throw new BadRequestException('Administradores devem ter status ativo');
    }

    return this.userRepository.create(createUserDto);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  async delete(id: string) {
    return this.userRepository.delete(id);
  }
}
