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
import { UserStatus } from '@prisma/client';

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
  @IsString()
  @Matches(/^(admin|manager|vet|farmer)$/, {
    message: 'Função inválida. Valores permitidos: admin, manager, vet, farmer',
  })
  role: string;

  @IsOptional()
  @IsEnum(UserStatus, {
    message: `Status inválido. Use: ${Object.values(UserStatus).join(', ')}`,
  })
  status?: UserStatus;
}
