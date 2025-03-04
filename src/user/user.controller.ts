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
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserStatus, UserRole } from '@prisma/client';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';


@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    console.log('findAll', page, limit);
    return this.usersService.findAll({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    return this.usersService.findByEmail(email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<UserResponseDto> {
    return this.usersService.login(loginDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    createUserDto.status = UserStatus.ACTIVE;
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateUserDto: {
      name?: string;
      email?: string;
      role?: UserRole;
      status?: UserStatus;
    },
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
