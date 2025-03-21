import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { Farm } from '@prisma/client';

@Injectable()
export class FarmRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca todas as fazendas com paginação e filtro por organização
   */
  async findAll(params: any): Promise<Farm[]> {
    const { 
      skip, 
      take, 
      page, 
      limit, 
      orderBy = { createdAt: 'desc' },
      organizationId 
    } = params;
    
    // Converter page/limit para skip/take se fornecidos
    const skipValue = skip ?? (page && limit ? (page - 1) * limit : undefined);
    const takeValue = take ?? limit;
    
    const where = { 
      deletedAt: null,
    };

    // Adiciona filtro por organização se fornecido
    if (organizationId) {
      where['organizationId'] = organizationId;
    }

    const [farms, total] = await Promise.all([
      this.prisma.farm.findMany({
        skip: skipValue,
        take: takeValue,
        where,
        orderBy,
      }),
      this.prisma.farm.count({ where }),
    ]);

    const result: any = {
      data: farms,
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
   * Busca uma fazenda pelo ID
   */
  async findById(id: string, organizationId?: string): Promise<Farm | null> {
    const where = { 
      id,
      deletedAt: null,
    };

    // Adiciona filtro de organização se fornecido
    if (organizationId) {
      where['organizationId'] = organizationId;
    }

    return this.prisma.farm.findFirst({
      where
    });
  }

  /**
   * Cria uma nova fazenda
   */
  async create(data: CreateFarmDto): Promise<Farm> {
    // Extrair organizationId do DTO
    const { organizationId, ...farmData } = data;
    
    // Usar relation connect para associar à organização
    return this.prisma.farm.create({
      data: {
        ...farmData,
        organization: {
          connect: {
            id: organizationId
          }
        }
      }
    });
  }

  /**
   * Atualiza uma fazenda
   */
  async update(id: string, data: UpdateFarmDto, organizationId?: string): Promise<Farm> {
    const where = { 
      id,
      deletedAt: null 
    };

    // Adiciona filtro de organização se fornecido
    if (organizationId) {
      where['organizationId'] = organizationId;
    }

    return this.prisma.farm.update({
      where,
      data
    });
  }

  /**
   * Exclui logicamente uma fazenda
   */
  async delete(id: string, organizationId?: string): Promise<Farm> {
    const where = { 
      id,
      deletedAt: null 
    };

    // Adiciona filtro de organização se fornecido
    if (organizationId) {
      where['organizationId'] = organizationId;
    }

    return this.prisma.farm.update({
      where,
      data: {
        deletedAt: new Date()
      }
    });
  }
} 