import { IsArray, IsDateString, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Animal } from 'src/animal/entities/animal.entity';
export class CreateCycleDto {
  @IsNotEmpty()
  @IsString()
  farmId: string;

  @IsNotEmpty()
  @IsArray()
  animalIds?: string[];

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  technician?: string;

  @IsOptional()
  @IsObject()
  d0Data?: {
    animalsData: Array<{
      identifier: string;
      cattleStatus: string;
      avaliacao: string;
      gestationalAge: number;
      observation?: string;
      animalId: string;
    }>;
  };
} 