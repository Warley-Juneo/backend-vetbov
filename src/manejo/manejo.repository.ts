import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateManejoDto } from './dto/create-manejo.dto';
import { UpdateManejoDto } from './dto/update-manejo.dto';
import { ManejoType, ManejoResult } from './entities/manejo.entity';

@Injectable()
export class ManejoRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    farmId?: string;
    animalsIds?: string[];
    startDate?: Date;
    endDate?: Date;
    type?: ManejoType;
    cycleId?: string;
  }) {
    const { skip, take, farmId, animalsIds, startDate, endDate, type, cycleId } = params;
    const where = { 
      deletedAt: null,
      ...(farmId && { farmId }),
      ...(animalsIds && { animalsIds }),
      ...(type && { type }),
      ...(cycleId && { cycleId }),
      ...(startDate && endDate && { 
        date: { 
          gte: startDate, 
          lte: endDate 
        } 
      }),
    };

    const [manejos, total] = await Promise.all([
      this.prisma.manejo.findMany({
        skip,
        take,
        where,
        include: {
          animals: {
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
      this.prisma.manejo.count({ where }),
    ]);

    return {
      data: manejos,
      total,
    };
  }

  async findById(id: string) {
    return this.prisma.manejo.findUnique({
      where: { id },
      include: {
        animals: {
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
    return this.prisma.manejo.findMany({
      where: { 
        cycleId,
        deletedAt: null 
      },
      include: {
        animals: {
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
    try {
      const skip = (page - 1) * limit;
      
      // Obter todos os protocolos para a fazenda sem filtrar por cycleId ainda
      const allManejos = await this.prisma.manejo.findMany({
        where: {
          farmId,
          deletedAt: null
        },
        select: {
          cycleId: true
        }
      });
      
      // Filtrar manualmente para obter cycleIds únicos e não-nulos
      const cycleIds = allManejos
        .map(p => p.cycleId)
        .filter(id => id !== null && id !== undefined && id.trim() !== '')
        .filter((value, index, self) => self.indexOf(value) === index); // remover duplicatas
      
      if (!cycleIds || cycleIds.length === 0) {
        return { data: [], total: 0 };
      }
      
      // Aplicar paginação na lista filtrada manualmente
      const paginatedCycleIds = cycleIds.slice(skip, skip + limit);
      
      // Verificar quais ciclos não estão deletados
      const activeCycles = await this.prisma.cycle.findMany({
        where: {
          id: { in: paginatedCycleIds },
          deletedAt: null
        },
        select: { id: true }
      });
      
      const activeCycleIds = activeCycles.map(c => c.id);
      
      // Processar cada ciclo com seus protocolos
      const cyclesWithDataPromises = activeCycleIds.map(async (cycleId) => {
        // Buscar dados do ciclo diretamente
        const cycleData = await this.prisma.cycle.findUnique({
          where: { id: cycleId },
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            technician: true,
            farmId: true, 
            farm: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });
        
        // Buscar todos os protocolos relacionados ao ciclo
        const manejos = await this.prisma.manejo.findMany({
          where: {
            cycleId,
            farmId,
            deletedAt: null
          },
          include: {
            animals: {
              select: {
                id: true,
                identifier: true
              }
            },
          },
          orderBy: {
            date: 'asc'
          }
        });

        if (!manejos || manejos.length === 0 || !cycleData) {
          return null;
        }

        // Calculamos estatísticas do ciclo
        const totalAnimals = new Set(manejos.map(p => p.animals)).size;
        const startDate = cycleData.startDate || manejos[0]?.date || null;
        const latestProtocol = manejos[manejos.length - 1];
        const latestProtocolType = latestProtocol?.type || null;

        // Quantidade de cada tipo de protocolo
        const d0Count = manejos.filter(p => p.type === ManejoType.D0).length;
        const d8Count = manejos.filter(p => p.type === ManejoType.D8).length;
        const d11Count = manejos.filter(p => p.type === ManejoType.D11).length;
        const dgCount = manejos.filter(p => p.type === ManejoType.DG).length;

        return {
          id: cycleId,
          cycleId: cycleId,
          name: cycleData.name,
          endDate: cycleData.endDate,
          technician: cycleData.technician,
          farmId: cycleData.farmId,
          farmName: cycleData.farm?.name,
          startDate,
          totalAnimals,
          animalsCount: totalAnimals,
          latestProtocolType,
          protocolCounts: {
            d0: d0Count,
            d8: d8Count,
            d11: d11Count,
            dg: dgCount
          },
          // Ciclo completo quando todos os animais têm DG
          complete: dgCount === totalAnimals && totalAnimals > 0
        };
      });

      // Filtramos ciclos que não puderam ser processados
      const cyclesWithData = (await Promise.all(cyclesWithDataPromises)).filter(Boolean);

      // Contagem total de ciclos para paginação
      try {
        const totalCyclesIds = await this.prisma.cycle.findMany({
          where: {
            id: { in: cycleIds },
            deletedAt: null
          },
          select: { id: true }
        });

        return {
          data: cyclesWithData,
          total: totalCyclesIds.length
        };
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async create(data: CreateManejoDto) {
    // Usando abordagem não relacional com tipos explícitos
    return this.prisma.manejo.create({
      data: {
        date: data.date,
        type: data.type,
        result: data.result,
        nextManejoDate: data.nextManejoDate,
        technician: data.technician,
        // IDs diretos para relacionamentos
        farmId: data.farmId,
        cycleId: data.cycleId,
        animals: {
          connect: data.animals.map(animal => ({ id: animal.id })),
        },
      },
      include: {
        animals: {
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

  async update(id: string, data: UpdateManejoDto) {
    // Construindo objeto de atualização com campos diretos
    const updateData: any = {};
    
    if (data.date !== undefined) updateData.date = data.date;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.result !== undefined) updateData.result = data.result;
    if (data.nextManejoDate !== undefined) updateData.nextManejoDate = data.nextManejoDate;
    if (data.observations !== undefined) updateData.observations = data.observations;
    if (data.technician !== undefined) updateData.technician = data.technician;
    if (data.cycleId !== undefined) updateData.cycleId = data.cycleId;
    if (data.farmId !== undefined) updateData.farmId = data.farmId;
    
    return this.prisma.manejo.update({
      where: { id },
      data: updateData,
      include: {
        animals: {
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
    return this.prisma.manejo.update({
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

    return this.prisma.manejo.findMany({
      where,
      include: {
        farm: {
          select: {
            name: true,
          },
        },
        animals: {
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
    const uniqueCycles = await this.prisma.manejo.findMany({
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
        const manejos = await this.prisma.manejo.findMany({
          where: {
            cycleId: cycle.cycleId,
            deletedAt: null,
          },
          include: {
            animals: {
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
          manejos,
        };
      })
    );

    return cycles;
  }

  async getMetrics(farmId?: string) {
    // Contagem total de inseminações (protocolos D0)
    const inseminationCount = await this.prisma.manejo.count({
      where: {
        deletedAt: null,
        type: ManejoType.D0,
        ...(farmId && { farmId }),
      },
    });

    // Contar diagnósticos positivos e total de DGs para taxa de prenhez
    const pregnancyTests = await this.prisma.manejo.findMany({
      where: {
        deletedAt: null,
        type: ManejoType.DG,
        ...(farmId && { farmId }),
      },
      select: {
        result: true,
      },
    });

    // Calcular taxa de prenhez
    const positiveTests = pregnancyTests.filter(
      (test) => test.result === ManejoResult.GESTANTE
    ).length;
    const pregnancyRate =
      pregnancyTests.length > 0
        ? (positiveTests / pregnancyTests.length) * 100
        : 0;

    // Contar animais em protocolo (animais com protocolos ativos)
    const uniqueAnimalsWithProtocols = await this.prisma.manejo.findMany({
      where: {
        deletedAt: null,
        ...(farmId && { farmId }),
      },
      select: {
        animals: true,
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
    const pregnancyTests = await this.prisma.manejo.findMany({
      where: {
        deletedAt: null,
        type: ManejoType.DG,
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
      (test) => test.result === ManejoResult.GESTANTE
    ).length;

    return pregnancyTests.length > 0
      ? (positiveTests / pregnancyTests.length) * 100
      : 0;
  }
} 