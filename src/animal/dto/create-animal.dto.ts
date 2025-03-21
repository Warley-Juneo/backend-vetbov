import { CattleStatus, Avaliacao } from '../entities/animal.entity';
import { IsEnum, IsDate, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateAnimalDto {
  @IsString()
  identifier: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsDate()
  @IsOptional()
  birthDate?: Date;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsEnum(CattleStatus)
  cattleStatus: CattleStatus;

  @IsEnum(Avaliacao)
  @IsOptional()
  avaliacao?: Avaliacao;

  @IsNumber()
  @IsOptional()
  gestationalAge?: number;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsString()
  farmId: string;
} 