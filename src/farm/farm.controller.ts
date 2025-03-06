import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('farms')
@UseGuards(JwtAuthGuard)
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  /**
   * Busca todas as fazendas com paginação
   */
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortField') sortField: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const orderBy = { [sortField]: sortOrder };
    return this.farmService.findAll({ page, limit, orderBy });
  }

  /**
   * Busca uma fazenda pelo ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.farmService.findById(id);
  }

  /**
   * Cria uma nova fazenda
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createFarmDto: CreateFarmDto) {
    return this.farmService.create(createFarmDto);
  }

  /**
   * Atualiza uma fazenda existente
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateFarmDto: UpdateFarmDto) {
    return this.farmService.update(id, updateFarmDto);
  }

  /**
   * Exclui uma fazenda (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.farmService.delete(id);
  }
} 