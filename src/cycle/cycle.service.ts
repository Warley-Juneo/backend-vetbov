import { Injectable, NotFoundException } from '@nestjs/common';
import { CycleRepository } from './cycle.repository';
import { ManejoRepository } from '../manejo/manejo.repository';
import { ManejoType, ManejoResult } from '../manejo/entities/manejo.entity';
import { ManejoService } from '../manejo/manejo.service';
import { CycleStatus } from './entities/cycle.entity';
import { Animal } from 'src/animal/entities/animal.entity';

@Injectable()
export class CycleService {
  constructor(
    private cycleRepository: CycleRepository,
    private protocolRepository: ManejoRepository,
  ) {}

  async findAll(params: {
    page: number;
    limit: number;
    farmId?: string;
  }) {
    const { page, limit, farmId } = params;
    const skip = (page - 1) * limit;

    return this.cycleRepository.findAll({
      skip,
      take: limit,
      farmId,
    });
  }

  async findById(id: string) {
    const cycle = await this.cycleRepository.findById(id);
    if (!cycle) {
      throw new NotFoundException(`Ciclo com ID '${id}' não encontrado`);
    }
    return cycle;
  }

  async updateStatus(id: string, status: string) {
    await this.findById(id); // Verifica se existe
    return this.cycleRepository.update(id, { status });
  }

  async createFullCycle(
    farmId: string, 
    animalsIds: string[], 
    startDate: Date, 
    technician?: string,
    name?: string,
    endDate?: Date,
    animalsData?: {
      identifier: string;
      cattleStatus: string;
      avaliacao: string;
      gestationalAge: number;
      observation?: string;
      animalId: string;
    }[]
  ) {
    // Criar o ciclo primeiro
    const cycle = await this.cycleRepository.create({
      farmId,
      startDate,
      endDate,
      name: name || `Ciclo ${new Date().toISOString().slice(0, 10)}`,
      technician,
      status: 'EM_ANDAMENTO'
    });
    
    // Calcular datas para cada etapa (D0, D8, D11, DG)
    const d0Date = new Date(startDate);
    const d8Date = new Date(startDate);
    d8Date.setDate(d8Date.getDate() + 8); // D8 é 8 dias depois de D0
    
    const d11Date = new Date(startDate);
    d11Date.setDate(d11Date.getDate() + 11); // D11 é 11 dias depois de D0
    
    const dgDate = new Date(startDate);
    dgDate.setDate(dgDate.getDate() + 30); // DG é aproximadamente 30 dias depois de D0
    
    // Criar protocolos D0 para cada animal
    const manejos = [];
    
    await this.protocolRepository.create({
      date: d0Date,
      type: ManejoType.D0,
      animals: animalsIds.map(id => ({ 
        id,
        identifier: '',
        cattleStatus: null,
        farmId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      farmId,
      technician,
      cycleId: cycle.id, // Usar o ID do ciclo criado
      nextManejoDate: d8Date,
    });
      
    return {
      ...cycle,
      manejos,
      nextDates: {
        d8: d8Date,
        d11: d11Date,
        dg: dgDate,
      }
    };
  }

  async delete(id: string) {
    const cycle = await this.findById(id);
    if (!cycle) {
      throw new NotFoundException(`Ciclo com ID '${id}' não encontrado`);
    }
    
    const result = await this.cycleRepository.delete(id);
  
    return result;
  }
}