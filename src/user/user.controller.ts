// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserStatus } from '@prisma/client';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.findAll({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateUserDto: {
      name?: string;
      email?: string;
      role?: string;
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
