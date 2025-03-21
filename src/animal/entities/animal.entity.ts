export enum CattleStatus {
  PARIDA = 'PARIDA',
  SOLTEIRA = 'SOLTEIRA',
  NOVILHA = 'NOVILHA',
  LACTANTE = 'LACTANTE',
}

export enum Avaliacao {
  CICLICANDO = 'CICLICANDO',
  NAO_CICLANDO = 'NAO_CICLANDO',
  SUSPEITA = 'SUSPEITA',
  DESCARTE = 'DESCARTE',
  ATRASADA = 'ATRASADA',
  GESTANTE = 'GESTANTE',
}

export class Animal {
  id: string;
  identifier: string;
  breed?: string;
  birthDate?: Date;
  weight?: number;
  cattleStatus: CattleStatus;
  avaliacao?: Avaliacao;
  gestationalAge?: number;
  observation?: string;
  farmId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
} 