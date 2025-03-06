import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProtocolDto } from './dto/create-protocol.dto';
import { UpdateProtocolDto } from './dto/update-protocol.dto';
import { ProtocolType, ProtocolResult } from './entities/protocol.entity';

@Injectable()
export class ProtocolRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    farmId?: string;
    animalId?: string;
    startDate?: Date;
    endDate?: Date;
    type?: ProtocolType;
    cycleId?: string;
  }) {
    const { skip, take, farmId, animalId, startDate, endDate, type, cycleId } = params;
    const where = { 
      deletedAt: null,
      ...(farmId && { farmId }),
      ...(animalId && { animalId }),
      ...(type && { type }),
      ...(cycleId && { cycleId }),
      ...(startDate && endDate && { 
        date: { 
          gte: startDate, 
          lte: endDate 
        } 
      }),
    };

    const [protocols, total] = await Promise.all([
      this.prisma.protocol.findMany({
        skip,
        take,
        where,
        include: {
          animal: {
            select: {
              id: true,
              identifier: true,
              cattleStatus: true,
            },
          },
          farm: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.protocol.count({ where }),
    ]);

    return {
      data: protocols,
      total,
    };
  }

  async findById(id: string) {
    return this.prisma.protocol.findUnique({
      where: { id },
      include: {
        animal: {
          select: {
            id: true,
            identifier: true,
            cattleStatus: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByCycleId(cycleId: string) {
    return this.prisma.protocol.findMany({
      where: { 
        cycleId,
        deletedAt: null 
      },
      include: {
        animal: {
          select: {
            id: true,
            identifier: true,
            cattleStatus: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findCyclesByFarmId(farmId: string, page: number = 1, limit: number = 10) {
    // Garantir que page e limit sejam números válidos
    const pageNum = Number.isNaN(Number(page)) ? 1 : Number(page);
    const limitNum = Number.isNaN(Number(limit)) ? 10 : Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    try {
      // Verificar se o farmId existe
      const farmExists = await this.prisma.farm.findUnique({
        where: { id: farmId }
      });
      
      if (!farmExists) {
        return { data: [], total: 0 };
      }
      
      // Primeiro, obtemos todos os cycleIds únicos para a fazenda
      const uniqueCycles = await this.prisma.protocol.findMany({
        where: {
          farmId,
          cycleId: {
            not: null,
          },
          deletedAt: null,
        },
        distinct: ['cycleId'],
        select: {
          cycleId: true,
        },
        skip,
        take: limitNum, // Usando o valor validado
      });
      
      // Proteção contra nulos no cycleId
      const validUniqueCycles = uniqueCycles.filter(cycle => cycle && cycle.cycleId);
      
      // Depois, para cada ciclo, obtemos o primeiro protocolo (geralmente D0)
      // e algumas informações sobre o ciclo
      const cyclesWithData = await Promise.all(
        validUniqueCycles.map(async (cycle) => {
          try {
            const protocols = await this.prisma.protocol.findMany({
              where: {
                cycleId: cycle.cycleId,
                deletedAt: null,
              },
              include: {
                animal: {
                  select: {
                    id: true,
                    identifier: true,
                  },
                },
              },
              orderBy: {
                date: 'asc',
              },
            });
            
            // Proteção contra arrays vazios
            if (!protocols || protocols.length === 0) {
              return {
                cycleId: cycle.cycleId,
                totalAnimals: 0,
                startDate: null,
                latestProtocolType: null,
                progress: {
                  d0: 0,
                  d8: 0,
                  d11: 0,
                  dg: 0,
                },
                complete: false,
              };
            }
            
            // Calculamos algumas estatísticas do ciclo
            const totalAnimals = new Set(protocols.map(p => p.animalId)).size;
            const startDate = protocols[0]?.date || null;
            const latestProtocolType = protocols[protocols.length - 1]?.type || null;
            
            // Quantidade de cada tipo de protocolo
            const d0Count = protocols.filter(p => p.type === ProtocolType.D0).length;
            const d8Count = protocols.filter(p => p.type === ProtocolType.D8).length;
            const d11Count = protocols.filter(p => p.type === ProtocolType.D11).length;
            const dgCount = protocols.filter(p => p.type === ProtocolType.DG).length;
            
            return {
              id: cycle.cycleId, // Adicionando id para compatibilidade com frontend
              cycleId: cycle.cycleId,
              totalAnimals,
              animalsCount: totalAnimals, // Adicionando campo para compatibilidade
              startDate,
              latestProtocolType,
              progress: {
                d0: d0Count,
                d8: d8Count,
                d11: d11Count,
                dg: dgCount,
              },
              // Adicionando campos para compatibilidade com frontend
              d0Completed: d0Count > 0,
              d8Completed: d8Count > 0,
              d11Completed: d11Count > 0,
              dgCompleted: dgCount > 0,
              complete: dgCount === totalAnimals && totalAnimals > 0,
            };
          } catch (error) {
            console.error(`Erro ao processar ciclo ${cycle.cycleId}:`, error);
            return null;
          }
        })
      );
      
      // Filtramos ciclos que não puderam ser processados
      const validCycles = cyclesWithData.filter(Boolean);
      
      try {
        // Contamos o total de ciclos únicos
        const totalCycles = await this.prisma.protocol.findMany({
          where: {
            farmId,
            cycleId: {
              not: null,
            },
            deletedAt: null,
          },
          distinct: ['cycleId'],
          select: {
            cycleId: true,
          },
        });
        
        return {
          data: validCycles,
          total: totalCycles.length,
        };
      } catch (error) {
        console.error(`Erro ao contar total de ciclos para fazenda ${farmId}:`, error);
        // Se falhar na contagem total, ainda retornamos os dados que conseguimos obter
        return {
          data: validCycles,
          total: validCycles.length, // Fallback para quantidade de ciclos obtidos
        };
      }
    } catch (error) {
      console.error(`Erro ao buscar ciclos para a fazenda ${farmId}:`, error);
      throw error;
    }
  }

  async create(data: CreateProtocolDto) {
    return this.prisma.protocol.create({
      data,
      include: {
        animal: {
          select: {
            id: true,
            identifier: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateProtocolDto) {
    return this.prisma.protocol.update({
      where: { id },
      data,
      include: {
        animal: {
          select: {
            id: true,
            identifier: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.protocol.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findCalendarEvents(startDate: Date, farmId?: string) {
    const where = {
      deletedAt: null,
      date: {
        gte: startDate,
      },
      ...(farmId && { farmId }),
    };

    return this.prisma.protocol.findMany({
      where,
      include: {
        farm: {
          select: {
            name: true,
          },
        },
        animal: {
          select: {
            identifier: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findRecentCycles(limit: number = 5, farmId?: string) {
    // Vamos agrupar protocolos por ciclo para obter os ciclos mais recentes
    const where = {
      deletedAt: null,
      cycleId: { not: null },
      ...(farmId && { farmId }),
    };

    // Primeiro, encontrar os ciclos únicos mais recentes
    const uniqueCycles = await this.prisma.protocol.findMany({
      where,
      distinct: ['cycleId'],
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      select: {
        cycleId: true,
        farmId: true,
      },
    });

    // Para cada ciclo, buscar todos os seus protocolos e informações da fazenda
    const cycles = await Promise.all(
      uniqueCycles.map(async (cycle) => {
        const protocols = await this.prisma.protocol.findMany({
          where: {
            cycleId: cycle.cycleId,
            deletedAt: null,
          },
          include: {
            animal: {
              select: {
                id: true,
                identifier: true,
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
        });

        // Buscar informações da fazenda
        const farm = await this.prisma.farm.findUnique({
          where: {
            id: cycle.farmId,
          },
          select: {
            id: true,
            name: true,
          },
        });

        return {
          cycleId: cycle.cycleId,
          farmId: cycle.farmId,
          farmName: farm?.name || 'Fazenda desconhecida',
          protocols,
        };
      })
    );

    return cycles;
  }

  async getMetrics(farmId?: string) {
    // Contagem total de inseminações (protocolos D0)
    const inseminationCount = await this.prisma.protocol.count({
      where: {
        deletedAt: null,
        type: ProtocolType.D0,
        ...(farmId && { farmId }),
      },
    });

    // Contar diagnósticos positivos e total de DGs para taxa de prenhez
    const pregnancyTests = await this.prisma.protocol.findMany({
      where: {
        deletedAt: null,
        type: ProtocolType.DG,
        ...(farmId && { farmId }),
      },
      select: {
        result: true,
      },
    });

    // Calcular taxa de prenhez
    const positiveTests = pregnancyTests.filter(
      (test) => test.result === ProtocolResult.GESTANTE
    ).length;
    const pregnancyRate =
      pregnancyTests.length > 0
        ? (positiveTests / pregnancyTests.length) * 100
        : 0;

    // Contar animais em protocolo (animais com protocolos ativos)
    const uniqueAnimalsWithProtocols = await this.prisma.protocol.findMany({
      where: {
        deletedAt: null,
        ...(farmId && { farmId }),
      },
      distinct: ['animalId'],
      select: {
        animalId: true,
      },
    });

    const animalsInProtocol = uniqueAnimalsWithProtocols.length;

    // Média de dias em aberto (simulada para agora)
    // Em uma implementação real, isso seria calculado com base em eventos de parto e prenhez
    const averageOpenDays = Math.floor(Math.random() * 50) + 50; // Valor simulado entre 50-100 dias

    return {
      inseminationCount,
      pregnancyRate,
      animalsInProtocol,
      averageOpenDays,
    };
  }

  async getMonthPregnancyRate(
    startDate: Date,
    endDate: Date,
    farmId?: string
  ): Promise<number> {
    // Buscar todos os diagnósticos de gestação no período
    const pregnancyTests = await this.prisma.protocol.findMany({
      where: {
        deletedAt: null,
        type: ProtocolType.DG,
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(farmId && { farmId }),
      },
      select: {
        result: true,
      },
    });

    // Calcular a taxa de prenhez para o mês
    const positiveTests = pregnancyTests.filter(
      (test) => test.result === ProtocolResult.GESTANTE
    ).length;

    return pregnancyTests.length > 0
      ? (positiveTests / pregnancyTests.length) * 100
      : 0;
  }
} 