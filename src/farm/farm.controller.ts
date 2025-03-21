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
  Req,
} from '@nestjs/common';
import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

// Estendendo o tipo Request para incluir organizationId e user
interface RequestWithOrg extends Request {
  user?: any;
}

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
    @Req() req: RequestWithOrg,
  ) {
    const pagination = {
      page,
      limit,
      orderBy: { [sortField]: sortOrder },
    };

    return this.farmService.findAll(pagination, req.user.organizationId);
  }

  /**
   * Busca uma fazenda pelo ID
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: RequestWithOrg,
  ) {
    return this.farmService.findById(id, req.user.organizationId);
  }

  /**
   * Cria uma nova fazenda
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createFarmDto: CreateFarmDto,
    @Req() req: RequestWithOrg,
  ) {
    // Garante que a fazenda pertença à organização do usuário logado
    if (req.user.organizationId) {
      createFarmDto.organizationId = req.user.organizationId;
    }
    
    return this.farmService.create(createFarmDto);
  }

  /**
   * Atualiza uma fazenda existente
   */
  @Put(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  update(
    @Param('id') id: string, 
    @Body() updateFarmDto: UpdateFarmDto,
    @Req() req: RequestWithOrg,
  ) {
    return this.farmService.update(id, updateFarmDto, req.user.organizationId);
  }

  /**
   * Exclui uma fazenda (soft delete)
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @Req() req: RequestWithOrg,
  ) {
    return this.farmService.delete(id, req.user.organizationId);
  }
} 