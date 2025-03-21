import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from 'src/user/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthResponse, JwtPayload } from 'src/interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida as credenciais do usuário
   */
  async validateUser(email: string, password: string): Promise<any> {
    const userWithPassword = await this.userService.findByEmailWithPassword(email);
    
    if (!userWithPassword) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, userWithPassword.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    const { password: _, ...result } = userWithPassword;
    return result;
  }

  /**
   * Cria um token JWT com base nos dados do usuário
   */
  createToken(user: any): AuthResponse {
    const payload: JwtPayload = { 
      sub: user.id, 
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId 
    };
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId
      },
      token: this.jwtService.sign(payload),
    };
  }

  /**
   * Realiza o login do usuário
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    return this.createToken(user);
  }

  /**
   * Registra um novo usuário e gera um token JWT
   */
  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const user = await this.userService.create(createUserDto);
    return this.createToken(user);
  }

  /**
   * Verifica a validade de um token JWT
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const payload = await this.jwtService.verify(token);
      return { valid: true, user: payload };
    } catch (error) {
      return { valid: false };
    }
  }
} 