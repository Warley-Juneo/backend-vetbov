import { Controller, Post, Body, HttpCode, HttpStatus, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/user/dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Get('verify')
  verifyTokenGet(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false };
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    return this.authService.verifyToken(token);
  }

  @Post('verify')
  verifyTokenPost(@Body() body: { token?: string }, @Headers('authorization') authHeader: string) {
    // Priorizar o token do body se fornecido
    let token = body.token;
    
    // Se não houver token no body, tentar pegar do header
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      return { valid: false };
    }
    
    return this.authService.verifyToken(token);
  }
} 