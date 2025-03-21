import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Injectable()
export class AnimalRepository {
  constructor(private prisma: PrismaService) {}

  // Constante reutilizável para incluir a fazenda com campos selecionados
  private readonly farmInclude = {
    farm: {
      select: {
        id: true,
        name: true,
      },
    },
  };

  async findAll(params: {
    skip?: number;
    take?: number;
    farmId?: string;
  }) {
    const { skip, take, farmId } = params;
    const where = { 
      deletedAt: null,
      ...(farmId && { farmId })
    };

    const [animals, total] = await Promise.all([
      this.prisma.animal.findMany({
        skip,
        take,
        where,
        include: this.farmInclude,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.animal.count({ where }),
    ]);

    return {
      data: animals,
      total,
    };
  }

  async findById(id: string) {
    return this.prisma.animal.findFirst({
      where: { 
        id,
        deletedAt: null 
      },
      include: this.farmInclude,
    });
  }

  async create(data: CreateAnimalDto) {
    const { farmId, ...animalData } = data;
    
    // Utilizando o padrão "connect" do Prisma para garantir que a fazenda existe
    return this.prisma.animal.create({
      data: {
        ...animalData,
        farm: {
          connect: {
            id: farmId
          }
        }
      },
      include: this.farmInclude,
    });
  }

  async update(id: string, data: UpdateAnimalDto) {
    // Primeiro verificamos se o animal existe e não está deletado
    const animal = await this.findById(id);
    
    if (!animal) {
      return null; // Animal não existe ou já está deletado
    }
    
    return this.prisma.animal.update({
      where: { id },
      data,
      include: this.farmInclude,
    });
  }

  async delete(id: string) {
    // Primeiro verificamos se o animal existe e não está deletado
    const animal = await this.findById(id);
    
    if (!animal) {
      return null; // Animal não existe ou já está deletado
    }
    
    return this.prisma.animal.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.farmInclude,
    });
  }
} 