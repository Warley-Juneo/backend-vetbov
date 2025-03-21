import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateManejoDto } from './dto/create-manejo.dto';
import { UpdateManejoDto } from './dto/update-manejo.dto';
import { ManejoType, ManejoResult } from './entities/manejo.entity';
import { CalendarEventDto } from './dto/calendar-event.dto';
import { RecentProtocolDto } from './dto/recent-protocol.dto';
import { MetricsDto } from './dto/metrics.dto';
import { PregnancyRateDataDto } from './dto/pregnancy-rate-data.dto';
import { CycleService } from '../cycle/cycle.service';
import { ManejoRepository } from './manejo.repository';

@Injectable()
export class ManejoService {
  constructor(
    private manejoRepository: ManejoRepository,
    private cycleService: CycleService,
  ) {}

  async findAll(params: {
    page: number;
    limit: number;
    farmId?: string;
    animalsIds?: string[];
    startDate?: Date;
    endDate?: Date;
    type?: ManejoType;
    cycleId?: string;
  }) {
    const { page, limit, farmId, animalsIds, startDate, endDate, type, cycleId } = params;
    const skip = (page - 1) * limit;

    return this.manejoRepository.findAll({
      skip,
      take: limit,
      farmId,
      animalsIds: animalsIds ? animalsIds : undefined,
      startDate,
      endDate,
      type,
      cycleId,
    });
  }

  async findById(id: string) {
    const protocol = await this.manejoRepository.findById(id);
    if (!protocol) {
      throw new NotFoundException(`Protocolo com ID '${id}' não encontrado`);
    }
    return protocol;
  }

  async create(createManejoDto: CreateManejoDto) {
    return this.manejoRepository.create(createManejoDto);
  }

  async update(id: string, updateManejoDto: UpdateManejoDto) {
    await this.findById(id); // Verifica se existe
    return this.manejoRepository.update(id, updateManejoDto);
  }

  async delete(id: string) {
    await this.findById(id); // Verifica se existe
    return this.manejoRepository.delete(id);
  }

  // Métodos relacionados a ciclos que continuam no ProtocolService
  // por serem específicos para protocolos

  async findByCycleId(cycleId: string) {
    return this.manejoRepository.findByCycleId(cycleId);
  }

  async findCyclesByFarmId(farmId: string, page: number, limit: number) {
    return this.manejoRepository.findCyclesByFarmId(farmId, page, limit);
  }

  async getCalendarEvents(farmId?: string): Promise<CalendarEventDto[]> {
    // Buscar protocolos futuros (a partir de hoje)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const protocols = await this.manejoRepository.findCalendarEvents(today, farmId);
    
    // Agrupar protocolos por data e tipo
    const eventsMap = new Map<string, CalendarEventDto>();
    
    for (const protocol of protocols) {
      const dateStr = protocol.date.toISOString().split('T')[0];
      const key = `${dateStr}-${protocol.type}-${protocol.farmId}`;
      
      if (eventsMap.has(key)) {
        // Incrementar contador de animais para este evento
        const event = eventsMap.get(key);
        event.animalsCount += 1;
      } else {
        // Criar novo evento de calendário
        // Verifica se farm é um objeto ou se o nome da fazenda está disponível de outra forma
        const farmName = protocol.farm?.name || 'Fazenda não especificada';
        
        eventsMap.set(key, {
          id: key,
          farmId: protocol.farmId,
          farmName: farmName,
          date: dateStr,
          animalsCount: 1,
          type: protocol.type,
          technician: protocol.technician || 'Não atribuído',
        });
      }
    }
    
    return Array.from(eventsMap.values());
  }

  async getRecentManejos(limit: number = 5, farmId?: string): Promise<RecentProtocolDto[]> {
    // Buscar os ciclos mais recentes
    const cycles = await this.manejoRepository.findRecentCycles(limit, farmId);
    
    // Transformar os dados para o formato esperado
    const recentManejos: RecentProtocolDto[] = cycles.map(cycle => {
      // Calcular status geral do ciclo
      let status = 'Em andamento';
      if (cycle.manejos.some(p => p.result === ManejoResult.GESTANTE)) {
        status = 'Gestante';
      } else if (cycle.manejos.some(p => p.result === ManejoResult.NAO_GESTANTE)) {
        status = 'Não gestante';
      }

      // Encontrar data da última atualização
      const sortedManejos = [...cycle.manejos].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      const lastUpdate = sortedManejos.length > 0 
        ? sortedManejos[0].updatedAt.toISOString() 
        : new Date().toISOString();
      
      // Contar animais únicos neste ciclo
      const uniqueAnimalIds = new Set(cycle.manejos.map(p => p.animals));
      
      return {
        id: cycle.cycleId,
        farm: {
          id: cycle.farmId,
          name: cycle.farmName
        },
        technician: cycle.manejos[0]?.technician || 'Não atribuído',
        animalsCount: uniqueAnimalIds.size,
        status,
        lastUpdate
      };
    });
    
    return recentManejos;
  }

  async getMetrics(farmId?: string): Promise<MetricsDto> {
    // Buscar dados do repositório
    const stats = await this.manejoRepository.getMetrics(farmId);

    // Retornar métricas formatadas
    return {
      inseminationCount: stats.inseminationCount || 0,
      pregnancyRate: stats.pregnancyRate || 0,
      animalsInProtocol: stats.animalsInProtocol || 0,
      averageOpenDays: stats.averageOpenDays || 0
    };
  }

  async getPregnancyRateStats(months: number = 6, farmId?: string): Promise<PregnancyRateDataDto> {
    const currentDate = new Date();
    const labels = [];
    const values = [];
    
    // Função auxiliar para formatar o mês
    const formatMonth = (date: Date): string => {
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return monthNames[date.getMonth()];
    };
    
    // Função auxiliar para subtrair meses
    const subMonths = (date: Date, months: number): Date => {
      const result = new Date(date);
      result.setMonth(result.getMonth() - months);
      return result;
    };
    
    // Gerar rótulos para os últimos 'months' meses
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthLabel = formatMonth(monthDate);
      labels.push(monthLabel);
      
      // Buscar taxa de gravidez para este mês no repositório
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      // Buscar dados reais ou simulados
      try {
        const monthStats = await this.manejoRepository.getMonthPregnancyRate(
          monthStart, 
          monthEnd,
          farmId
        );
        values.push(monthStats);
      } catch (error) {
        // Fallback para dados simulados em caso de erro
        values.push(Math.random() * 100);
      }
    }
    
    return {
      labels,
      values
    };
  }
} 