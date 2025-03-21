/**
 * Status possíveis para um ciclo de protocolo
 */
export enum CycleStatus {
  /**
   * Ciclo em andamento
   */
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  
  /**
   * Ciclo concluído com sucesso (animal prenhe)
   */
  CONCLUIDO = 'CONCLUIDO',
  
  /**
   * Ciclo concluído sem sucesso (animal não prenhe)
   */
  NAO_PRENHE = 'NAO_PRENHE',
  
  /**
   * Ciclo cancelado por algum motivo
   */
  CANCELADO = 'CANCELADO',
}

/**
 * Entidade principal de Ciclo de Protocolo
 */
export class Cycle {
  /**
   * Identificador único do ciclo
   */
  id: string;
  
  /**
   * Nome do ciclo para identificação
   */
  name?: string;
  
  /**
   * ID da fazenda onde o ciclo está ocorrendo
   */
  farmId: string;
  
  /**
   * Data de início do ciclo (data do protocolo D0)
   */
  startDate: Date;
  
  /**
   * Data de conclusão do ciclo (após DG)
   */
  endDate?: Date;
  
  /**
   * Status atual do ciclo
   */
  status: CycleStatus;
  
  /**
   * Técnico responsável pelo ciclo
   */
  technician?: string;
  
  /**
   * Observações gerais sobre o ciclo
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