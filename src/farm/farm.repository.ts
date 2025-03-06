import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { Farm } from '@prisma/client';
import { PaginatedResult, PaginationParams } from 'src/common/interfaces';

@Injectable()
export class FarmRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca todas as fazendas com paginação
   */
  async findAll(params: PaginationParams): Promise<PaginatedResult<Farm>> {
    const { skip, take, page, limit, orderBy = { createdAt: 'desc' } } = params;
    
    // Converter page/limit para skip/take se fornecidos
    const skipValue = skip ?? (page && limit ? (page - 1) * limit : undefined);
    const takeValue = take ?? limit;
    
    const where = { 
      deletedAt: null,
    };

    const [farms, total] = await Promise.all([
      this.prisma.farm.findMany({
        skip: skipValue,
        take: takeValue,
        where,
        orderBy,
      }),
      this.prisma.farm.count({ where }),
    ]);

    const result: PaginatedResult<Farm> = {
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
  async findById(id: string): Promise<Farm | null> {
    return this.prisma.farm.findUnique({
      where: { id },
    });
  }

  /**
   * Cria uma nova fazenda
   */
  async create(data: CreateFarmDto): Promise<Farm> {
    return this.prisma.farm.create({
      data,
    });
  }

  /**
   * Atualiza uma fazenda existente
   */
  async update(id: string, data: UpdateFarmDto): Promise<Farm> {
    return this.prisma.farm.update({
      where: { id },
      data,
    });
  }

  /**
   * Marca uma fazenda como excluída (soft delete)
   */
  async delete(id: string): Promise<Farm> {
    return this.prisma.farm.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
} 