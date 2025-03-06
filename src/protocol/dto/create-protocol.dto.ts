import { ProtocolResult, ProtocolType } from '../entities/protocol.entity';

export class CreateProtocolDto {
  date: Date; // Data do protocolo/visita
  type: ProtocolType; // Tipo de protocolo
  animalId: string; // ID do animal relacionado
  farmId: string; // ID da fazenda onde foi realizado
  technician?: string; // Nome do técnico responsável
  observations?: string; // Observações gerais
  result?: ProtocolResult; // Resultado do protocolo
  presence?: boolean = true; // Presença confirmada (usado principalmente para D8 e D11)
  cycleId?: string; // Identificador único do ciclo para agrupar protocolos relacionados
  nextProtocolDate?: Date; // Data prevista para o próximo protocolo
} 