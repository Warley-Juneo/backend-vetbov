import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { UserStatus, UserRole } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';

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
      createUserDto.role === UserRole.ADMIN &&
      createUserDto.status !== UserStatus.ACTIVE
    ) {
      throw new BadRequestException('Administradores devem ter status ativo');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userToCreate = {
      ...createUserDto,
      password: hashedPassword,
    };

    const createdUser = await this.userRepository.create(userToCreate);
    const { password, ...result } = createdUser;
    return result as UserResponseDto;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  async delete(id: string) {
    return this.userRepository.delete(id);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    
    const { password, ...result } = user;
    return result as UserResponseDto;
  }

  async login(loginDto: LoginDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { password, ...result } = user;
    return result as UserResponseDto;
  }
}
