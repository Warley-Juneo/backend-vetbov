import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserStatus, UserRole } from '@prisma/client';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';


@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.findAll({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('email/:email')
  findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    return this.usersService.findByEmail(email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    createUserDto.status = UserStatus.ACTIVE;
    return this.usersService.register(createUserDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    createUserDto.status = UserStatus.ACTIVE;
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('email/:email')
  update(
    @Param('email') email: string,
    @Body()
    updateUserDto: {
      name?: string;
      email?: string;
      role?: UserRole;
      status?: UserStatus;
    },
  ) {
    return this.usersService.update(email, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('email/:email')
  remove(@Param('email') email: string) {
    return this.usersService.delete(email);
  }

  @Get('verify-token')
  verifyToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false };
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    return this.usersService.verifyToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @CurrentUser() user, 
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.usersService.changePassword(
      user.email, 
      changePasswordDto.currentPassword, 
      changePasswordDto.newPassword
    );
  }
}
