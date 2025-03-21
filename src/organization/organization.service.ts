import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: createOrganizationDto,
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        skip,
        take,
        where: {
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              users: true,
              farms: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.organization.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return {
      data: organizations,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        farms: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });
  }

  async remove(id: string) {
    return this.prisma.organization.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
} 