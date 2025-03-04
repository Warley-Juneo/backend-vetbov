// src/users/dtos/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { UserStatus, UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(UserRole, {
    message: `Função inválida. Use: ${Object.values(UserRole).join(', ')}`,
  })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, {
    message: `Status inválido. Use: ${Object.values(UserStatus).join(', ')}`,
  })
  status?: UserStatus;
}


