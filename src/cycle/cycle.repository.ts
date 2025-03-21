import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cycle, CycleStatus } from './entities/cycle.entity';

@Injectable()
export class CycleRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca todos os ciclos com paginação
   */
  async findAll(params: any): Promise<any> {
    const { skip, take, page, limit, orderBy = { createdAt: 'desc' }, farmId } = params;
    
    // Converter page/limit para skip/take se fornecidos
    const skipValue = skip ?? (page && limit ? (page - 1) * limit : undefined);
    const takeValue = take ?? limit;
    
    const where = { 
      deletedAt: null,
      ...(farmId && { farmId }),
    };

    const [cycles, total] = await Promise.all([
      this.prisma.cycle.findMany({
        skip: skipValue,
        take: takeValue,
        where,
        orderBy,
        include: {
          farm: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      this.prisma.cycle.count({ where }),
    ]);

    // Converter status de string para enum
    const formattedCycles = cycles.map(cycle => ({
      ...cycle,
      status: cycle.status as CycleStatus
    }));

    const result: any = {
      data: formattedCycles,
      total,
    };

    // Adicionar metadados de paginação se page/limit fornecidos
    if (page && limit) {
      result.page = page;
      result.limit = limit;
      result.last_page = Math.ceil(total / limit);
    }

    return result;
  }

  /**
   * Busca um ciclo pelo ID
   */
  async findById(id: string): Promise<Cycle | null> {
    const cycle = await this.prisma.cycle.findFirst({
      where: { 
        id,
        deletedAt: null
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true
          }
        },
        manejos: {
          where: {
            type: 'D0'
          },
          include: {
            animals: true
          }
        }
      }
    });

    if (!cycle) return null;

    // Converter status de string para enum
    return {
      ...cycle,
      status: cycle.status as CycleStatus
    };
  }

  /**
   * Cria um novo ciclo
   */
  async create(data: any): Promise<Cycle> {
    const cycle = await this.prisma.cycle.create({
      data: {
        ...data,
        status: data.status || CycleStatus.EM_ANDAMENTO
      },
    });
    
    return {
      ...cycle,
      status: cycle.status as CycleStatus
    };
  }

  /**
   * Atualiza um ciclo existente
   */
  async update(id: string, data: any): Promise<Cycle> {
    // Verificar primeiro se o ciclo existe e não está deletado
    const cycleExists = await this.findById(id);
    if (!cycleExists) {
      throw new Error(`Ciclo com ID '${id}' não encontrado`);
    }

    const cycle = await this.prisma.cycle.update({
      where: { id },
      data,
    });
    
    return {
      ...cycle,
      status: cycle.status as CycleStatus
    };
  }

  /**
   * Marca um ciclo como excluído (soft delete)
   */
  async delete(id: string): Promise<Cycle> {
    // Verificar primeiro se o ciclo existe e não está deletado
    const cycleExists = await this.findById(id);
    if (!cycleExists) {
      throw new Error(`Ciclo com ID '${id}' não encontrado`);
    }

    const cycle = await this.prisma.cycle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    
    return {
      ...cycle,
      status: cycle.status as CycleStatus
    };
  }

  /**
   * Busca ciclos para uma fazenda específica
   */
  async findByFarmId(farmId: string, page: number = 1, limit: number = 10): Promise<any> {
    return this.findAll({
      farmId,
      page,
      limit
    });
  }
} 