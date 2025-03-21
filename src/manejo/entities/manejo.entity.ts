// Reexportar os tipos do Prisma ao invés de redefini-los
import { ManejoType as PrismaManejoType, ManejoResult as PrismaManejoResult } from '@prisma/client';

// Reexportando os enums do Prisma
export { PrismaManejoType as ManejoType, PrismaManejoResult as ManejoResult };

/**
 * Entidade principal de Manejo
 */
export class Manejo {
  /**
   * Identificador único do Manejo
   */
  id: string;
  
  /**
   * Data de realização do Manejo
   */
  date: Date;
  
  /**
   * Tipo do Manejo
   */
  type: PrismaManejoType;
  
  /**
   * ID do animal associado
   */
  animalId: string;
  
  /**
   * ID da fazenda onde o Manejo foi realizado
   */
  farmId: string;
  
  /**
   * Técnico responsável pelo Manejo
   */
  technician?: string;
  
  /**
   * ID do ciclo ao qual este Manejo pertence
   */
  cycleId?: string;
  
  /**
   * Data prevista para o próximo Manejo
   */
  nextManejoDate?: Date;
  
  /**
   * Resultado do Manejo
   */
  result?: PrismaManejoResult;
  
  /**
   * Observações adicionais
   */
  observations?: string;
  
  /**
   * Data de criação do registro
   */
  createdAt: Date;
  
  /**
   * Data da última atualização do registro
   */
  updatedAt: Date;
  
  /**
   * Data de exclusão lógica (soft delete)
   */
  deletedAt?: Date;
} 