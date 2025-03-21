import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ManejoService } from './manejo.service';
import { CreateManejoDto } from './dto/create-manejo.dto';
import { UpdateManejoDto } from './dto/update-manejo.dto';
import { ManejoType, ManejoResult } from './entities/manejo.entity';
import { CalendarEventDto } from './dto/calendar-event.dto';
import { RecentProtocolDto } from './dto/recent-protocol.dto';
import { MetricsDto } from './dto/metrics.dto';
import { PregnancyRateDataDto } from './dto/pregnancy-rate-data.dto';
import { CreateCycleDto } from './dto/create-cycle.dto';

@Controller('manejos')
export class ManejoController {
  constructor(private readonly manejoService: ManejoService) {}

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('farmId') farmId?: string,
    @Query('animalId') animalId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('type') type?: ManejoType,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.manejoService.findAll({
      page,
      limit,
      farmId,
      animalsIds: animalId ? [animalId] : undefined,
      startDate,
      endDate,
      type,
      cycleId,
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.manejoService.findById(id);
  }

  @Post()
  create(@Body() createManejoDto: CreateManejoDto) {
    return this.manejoService.create(createManejoDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateManejoDto: UpdateManejoDto) {
    return this.manejoService.update(id, updateManejoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.manejoService.delete(id);
  }

  // ========== Endpoints específicos para o fluxo de manejos ==========

  @Post('d0')
  createD0Manejo(@Body() manejo: CreateManejoDto) {
    // Garantir que o tipo seja D0
    const manejoData = {
      ...manejo,
      type: ManejoType.D0,
      // Gerar um cycleId único se não for fornecido
      cycleId: manejo.cycleId || `cycle-${Date.now()}`,
      // Resultado inicial baseado no diagnóstico
      result: manejo.result || ManejoResult.EM_ANDAMENTO,
    };
    
    return this.manejoService.create(manejoData);
  }

  @Post('d8/:cycleId')
  createD8Manejo(
    @Param('cycleId') cycleId: string,
    @Body() manejo: CreateManejoDto
  ) {
    const manejoData = {
      ...manejo,
      type: ManejoType.D8,
      cycleId,
      result: ManejoResult.EM_ANDAMENTO,
    };
    
    return this.manejoService.create(manejoData);
  }

  @Post('d11/:cycleId')
  createD11Manejo(
    @Param('cycleId') cycleId: string,
    @Body() manejo: CreateManejoDto
  ) {
    const manejoData = {
      ...manejo,
      type: ManejoType.D11,
      cycleId,
      result: ManejoResult.EM_ANDAMENTO,
    };
    
    return this.manejoService.create(manejoData);
  }

  @Post('dg/:cycleId')
  createDGManejo(
    @Param('cycleId') cycleId: string,
    @Body() manejo: CreateManejoDto
  ) {
    const manejoData = {
      ...manejo,
      type: ManejoType.DG,
      cycleId,
    };
    
    return this.manejoService.create(manejoData);
  }

  @Get('cycle/:cycleId')
  findManejosByCycleId(@Param('cycleId') cycleId: string) {
    return this.manejoService.findByCycleId(cycleId);
  }

  @Get('farm/:farmId/cycles')
  async findCyclesByFarmId(
    @Param('farmId') farmId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    // Convertendo explicitamente para número
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    return this.manejoService.findCyclesByFarmId(farmId, pageNum, limitNum);
  }

  // Endpoint para buscar eventos de calendário
  @Get('calendar-events')
  async getCalendarEvents(@Query('farmId') farmId?: string): Promise<CalendarEventDto[]> {
    return this.manejoService.getCalendarEvents(farmId);
  }

  // Endpoint para buscar protocolos recentes
  @Get('recent')
  async getRecentProtocols(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('farmId') farmId?: string
  ): Promise<RecentProtocolDto[]> {
    return this.manejoService.getRecentManejos(limit || 5, farmId);
  }

  // Endpoint para buscar métricas do dashboard
  @Get('metrics')
  async getMetrics(@Query('farmId') farmId?: string): Promise<MetricsDto> {
    return this.manejoService.getMetrics(farmId);
  }

  // Endpoint para buscar estatísticas de taxa de prenhez
  @Get('stats/pregnancy-rate')
  async getPregnancyRateStats(
    @Query('months', new ParseIntPipe({ optional: true })) months?: number,
    @Query('farmId') farmId?: string
  ): Promise<PregnancyRateDataDto> {
    return this.manejoService.getPregnancyRateStats(months || 6, farmId);
  }

  @Post('cycle')
  createCycleForBackwardCompatibility(@Body() createCycleDto: CreateCycleDto) {
    // Redirecionando para o serviço de ciclo
    const cycleService = this.manejoService['cycleService']; // Acesso à dependência injetada
    return cycleService.createFullCycle(
      createCycleDto.farmId,
      createCycleDto.animalIds,
      new Date(createCycleDto.startDate),
      createCycleDto.technician,
      createCycleDto.name,
      createCycleDto.endDate ? new Date(createCycleDto.endDate) : undefined
    );
  }
} 