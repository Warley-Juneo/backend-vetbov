import { Injectable, NotFoundException } from '@nestjs/common';
import { AnimalRepository } from './animal.repository';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Injectable()
export class AnimalService {
  constructor(private animalRepository: AnimalRepository) {}

  async findAll(params: {
    page: number;
    limit: number;
    farmId?: string;
  }) {
    const { page, limit, farmId } = params;
    const skip = (page - 1) * limit;

    return this.animalRepository.findAll({
      skip,
      take: limit,
      farmId,
    });
  }

  async findById(id: string) {
    const animal = await this.animalRepository.findById(id);
    
    if (!animal) {
      throw new NotFoundException(`Animal com ID ${id} não encontrado`);
    }
    
    return animal;
  }

  async create(createAnimalDto: CreateAnimalDto) {
    return this.animalRepository.create(createAnimalDto);
  }

  async update(id: string, updateAnimalDto: UpdateAnimalDto) {
    await this.findById(id);
    return this.animalRepository.update(id, updateAnimalDto);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.animalRepository.delete(id);
  }
} 