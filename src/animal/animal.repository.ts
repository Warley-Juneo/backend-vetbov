import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Injectable()
export class AnimalRepository {
  constructor(private prisma: PrismaService) {}

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
        include: {
          farm: {
            select: {
              id: true,
              name: true,
            },
          },
        },
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
    return this.prisma.animal.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async create(data: CreateAnimalDto) {
    return this.prisma.animal.create({
      data,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateAnimalDto) {
    return this.prisma.animal.update({
      where: { id },
      data,
      include: {
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
    return this.prisma.animal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
} 