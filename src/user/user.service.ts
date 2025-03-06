import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { UserStatus, UserRole } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { AuthResponse } from 'src/interfaces/auth.interface';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  /**
   * Busca todos os usuários com paginação
   */
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

  /**
   * Cria um novo usuário
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
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

  /**
   * Atualiza um usuário existente
   */
  async update(email: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(email, updateUserDto);
  }

  /**
   * Marca um usuário como excluído (soft delete)
   */
  async delete(email: string) {
    return this.userRepository.delete(email);
  }

  /**
   * Busca um usuário pelo email, excluindo a senha do resultado
   */
  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    
    const { password, ...result } = user;
    return result as UserResponseDto;
  }

  /**
   * Método que retorna o usuário com a senha, para fins de autenticação
   * @internal - Usado apenas para autenticação
   */
  async findByEmailWithPassword(email: string): Promise<any> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Realiza o login do usuário delegando para o AuthService
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  /**
   * Registra um novo usuário delegando para o AuthService
   */
  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    return this.authService.register(createUserDto);
  }

  /**
   * Verifica a validade de um token JWT delegando para o AuthService
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: any }> {
    return this.authService.verifyToken(token);
  }

  /**
   * Altera a senha do usuário
   */
  async changePassword(email: string, currentPassword: string, newPassword: string) {
    const user = await this.findByEmailWithPassword(email);
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.userRepository.update(email, { password: hashedPassword });
    
    return { message: 'Senha alterada com sucesso' };
  }
}
