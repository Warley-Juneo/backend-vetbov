import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { CycleService } from './cycle.service';
import { CreateCycleDto } from '../manejo/dto/create-cycle.dto';

@Controller('manejos/cycles')
export class CycleController {
  constructor(private readonly cycleService: CycleService) {}

  @Post()
  createCycle(@Body() createCycleDto: CreateCycleDto) {
    return this.cycleService.createFullCycle(
      createCycleDto.farmId,
      createCycleDto.animalIds,
      new Date(createCycleDto.startDate),
      createCycleDto.technician,
      createCycleDto.name,
      createCycleDto.endDate ? new Date(createCycleDto.endDate) : undefined,
      createCycleDto.d0Data?.animalsData
    );
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('farmId') farmId?: string,
  ) {
    return this.cycleService.findAll({ page, limit, farmId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cycleService.findById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.cycleService.updateStatus(id, status);
  }

  @Get(':id/manejos')
  findCycleManejos(@Param('id') id: string) {
    return this.cycleService['protocolRepository'].findByCycleId(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.cycleService.delete(id);
  }
} 