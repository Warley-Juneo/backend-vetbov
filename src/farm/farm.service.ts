import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { FarmRepository } from './farm.repository';
import { Farm } from '@prisma/client';
import { PaginatedResult, PaginationParams } from 'src/common/interfaces';

@Injectable()
export class FarmService {
  constructor(private readonly farmRepository: FarmRepository) {}

  /**
   * Busca todas as fazendas com paginação
   */
  async findAll(pagination: PaginationParams): Promise<PaginatedResult<Farm>> {
    return this.farmRepository.findAll(pagination);
  }

  /**
   * Busca uma fazenda pelo ID
   * @throws NotFoundException se a fazenda não for encontrada
   */
  async findById(id: string): Promise<Farm> {
    const farm = await this.farmRepository.findById(id);
    
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
  async update(id: string, updateFarmDto: UpdateFarmDto): Promise<Farm> {
    // Verifica se a fazenda existe
    await this.findById(id);
    
    return this.farmRepository.update(id, updateFarmDto);
  }

  /**
   * Marca uma fazenda como excluída (soft delete)
   * @throws NotFoundException se a fazenda não for encontrada
   */
  async delete(id: string): Promise<Farm> {
    // Verifica se a fazenda existe
    await this.findById(id);
    
    return this.farmRepository.delete(id);
  }
} 