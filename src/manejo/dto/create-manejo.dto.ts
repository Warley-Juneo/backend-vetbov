import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ManejoType, ManejoResult } from '../entities/manejo.entity';
import { Animal } from 'src/animal/entities/animal.entity';

/**
 * DTO para criação de um novo Manejoo
 */
export class CreateManejoDto {
  /**
   * Data do Manejoo
   */
  @IsDate()
  @IsNotEmpty()
  date: Date;

  /**
   * Tipo do Manejoo (D0, D8, D11, DG)
   */
  @IsEnum(ManejoType)
  @IsNotEmpty()
  type: ManejoType;

  @IsNotEmpty()
  animals: Animal[];

  /**
   * ID da fazenda onde o Manejoo ocorreu
   */
  @IsUUID()
  @IsNotEmpty()
  farmId: string;

  /**
   * Nome do técnico responsável pelo Manejoo
   */
  @IsString()
  @IsOptional()
  technician?: string;

  /**
   * ID do ciclo ao qual este Manejoo pertence
   */
  @IsString()
  @IsOptional()
  cycleId?: string;

  /**
   * Data do próximo Manejoo (planejamento)
   */
  @IsDate()
  @IsOptional()
  nextManejoDate?: Date;

  /**
   * Resultado do Manejoo (EM_ANDAMENTO, GESTANTE, NAO_GESTANTE, etc)
   */
  @IsEnum(ManejoResult)
  @IsOptional()
  result?: ManejoResult;

  /**
   * Observações sobre o Manejoo
   */
  @IsString()
  @IsOptional()
  observations?: string;

  /**
   * Categoria do Manejoo (GESTANTE, SOLTEIRA, etc)
   */
  @IsString()
  @IsOptional()
  category?: string;

  /**
   * Avaliação do Manejoo
   */
  @IsString()
  @IsOptional()
  avaliacao?: string;
} 