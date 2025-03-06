import { CattleStatus } from '../entities/animal.entity';

export class CreateAnimalDto {
  identifier: string;
  breed?: string;
  birthDate?: Date;
  weight?: number;
  cattleStatus: CattleStatus;
  observations?: string;
  farmId: string;
} 