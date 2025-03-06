export enum ProtocolType {
  D0 = 'D0',           // Diagnóstico inicial
  D8 = 'D8',           // Aplicação do implante
  D11 = 'D11',         // Retirada do implante
  DG = 'DG'            // Diagnóstico de gestação
}

export enum ProtocolResult {
  GESTANTE = 'GESTANTE',
  NAO_GESTANTE = 'NAO_GESTANTE',
  PARIDA = 'PARIDA',
  SOLTEIRA = 'SOLTEIRA',
  DESCARTE = 'DESCARTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO'
}

export class Protocol {
  id: string;
  
  // Data do protocolo
  date: Date;
  
  // Tipo de protocolo (D0, D8, D11, DG)
  type: ProtocolType;
  
  // ID do animal relacionado
  animalId: string;
  
  // ID da fazenda onde foi realizado
  farmId: string;
  
  // Técnico responsável
  technician?: string;
  
  // Observações gerais
  observations?: string;
  
  // Resultado do protocolo
  result?: ProtocolResult;
  
  // Presença confirmada (usado principalmente para D8 e D11)
  presence: boolean;
  
  // Identificador único do ciclo para agrupar protocolos relacionados
  cycleId?: string;
  
  // Próxima data prevista
  nextProtocolDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
} 