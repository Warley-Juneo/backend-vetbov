export enum CattleStatus {
  PARIDA = 'PARIDA',
  SOLTEIRA = 'SOLTEIRA',
  GESTANTE = 'GESTANTE',
  DESCARTE = 'DESCARTE',
}

export class Animal {
  id: string;
  identifier: string;
  breed?: string;
  birthDate?: Date;
  weight?: number;
  cattleStatus: CattleStatus;
  observations?: string;
  farmId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
} 