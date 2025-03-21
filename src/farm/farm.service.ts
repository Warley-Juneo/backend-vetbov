import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { FarmRepository } from './farm.repository';
import { Farm } from '@prisma/client';

@Injectable()
export class FarmService {
  constructor(private readonly farmRepository: FarmRepository) {}

  /**
   * Busca todas as fazendas com paginação
   */
  async findAll(pagination: any, organizationId?: string): Promise<Farm[]> {
    return this.farmRepository.findAll({
      ...pagination,
      organizationId
    });
  }

  /**
   * Busca uma fazenda pelo ID
   * @throws NotFoundException se a fazenda não for encontrada
   */
  async findById(id: string, organizationId?: string): Promise<Farm> {
    const farm = await this.farmRepository.findById(id, organizationId);
    
    if (!farm) {
      throw new NotFoundException(`Fazenda com ID ${id} não encontrada`);
    }
    
    return farm;
  }

  /**
   * Cria uma nova fazenda
   */
  async create(createFarmDto: CreateFarmDto): Promise<Farm> {
    return this.farmRepository.create(createFarmDto);
  }

  /**
   * Atualiza uma fazenda existente
   * @throws NotFoundException se a fazenda não for encontrada
   */
  async update(id: string, updateFarmDto: UpdateFarmDto, organizationId?: string): Promise<Farm> {
    // Verificar se a fazenda existe
    await this.findById(id, organizationId);
    
    return this.farmRepository.update(id, updateFarmDto, organizationId);
  }

  /**
   * Exclui logicamente uma fazenda (soft delete)
   * @throws NotFoundException se a fazenda não for encontrada
   */
  async delete(id: string, organizationId?: string): Promise<Farm> {
    // Verificar se a fazenda existe
    await this.findById(id, organizationId);
    
    return this.farmRepository.delete(id, organizationId);
  }
} 