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
import { ProtocolService } from './protocol.service';
import { CreateProtocolDto } from './dto/create-protocol.dto';
import { UpdateProtocolDto } from './dto/update-protocol.dto';
import { ProtocolType, ProtocolResult } from './entities/protocol.entity';
import { CalendarEventDto } from './dto/calendar-event.dto';
import { RecentProtocolDto } from './dto/recent-protocol.dto';
import { MetricsDto, PregnancyRateDataDto } from './dto/metrics.dto';

// Criar um DTO específico para iniciar um ciclo
class CreateCycleDto {
  farmId: string;
  animalIds: string[];
  startDate: Date;
  technician?: string;
}

@Controller('protocols')
export class ProtocolController {
  constructor(private readonly protocolService: ProtocolService) {}

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('farmId') farmId?: string,
    @Query('animalId') animalId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('type') type?: ProtocolType,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.protocolService.findAll({
      page,
      limit,
      farmId,
      animalId,
      startDate,
      endDate,
      type,
      cycleId,
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.protocolService.findById(id);
  }

  @Post()
  create(@Body() createProtocolDto: CreateProtocolDto) {
    return this.protocolService.create(createProtocolDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProtocolDto: UpdateProtocolDto) {
    return this.protocolService.update(id, updateProtocolDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.protocolService.delete(id);
  }

  // ========== Endpoints específicos para o fluxo de protocolo ==========

  @Post('d0')
  createD0Protocol(@Body() protocol: CreateProtocolDto) {
    // Garantir que o tipo seja D0
    const protocolData = {
      ...protocol,
      type: ProtocolType.D0,
      // Gerar um cycleId único se não for fornecido
      cycleId: protocol.cycleId || `cycle-${Date.now()}`,
      // Resultado inicial baseado no diagnóstico
      result: protocol.result || ProtocolResult.EM_ANDAMENTO,
    };
    
    return this.protocolService.create(protocolData);
  }

  @Post('d8/:cycleId')
  createD8Protocol(
    @Param('cycleId') cycleId: string,
    @Body() protocol: CreateProtocolDto
  ) {
    const protocolData = {
      ...protocol,
      type: ProtocolType.D8,
      cycleId,
      result: ProtocolResult.EM_ANDAMENTO,
    };
    
    return this.protocolService.create(protocolData);
  }

  @Post('d11/:cycleId')
  createD11Protocol(
    @Param('cycleId') cycleId: string,
    @Body() protocol: CreateProtocolDto
  ) {
    const protocolData = {
      ...protocol,
      type: ProtocolType.D11,
      cycleId,
      result: ProtocolResult.EM_ANDAMENTO,
    };
    
    return this.protocolService.create(protocolData);
  }

  @Post('dg/:cycleId')
  createDGProtocol(
    @Param('cycleId') cycleId: string,
    @Body() protocol: CreateProtocolDto
  ) {
    const protocolData = {
      ...protocol,
      type: ProtocolType.DG,
      cycleId,
    };
    
    return this.protocolService.create(protocolData);
  }

  @Get('cycle/:cycleId')
  findProtocolsByCycleId(@Param('cycleId') cycleId: string) {
    return this.protocolService.findByCycleId(cycleId);
  }

  @Get('farm/:farmId/cycles')
  findCyclesByFarmId(
    @Param('farmId') farmId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    // Convertendo explicitamente para número
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    return this.protocolService.findCyclesByFarmId(farmId, pageNum, limitNum);
  }

  // Endpoint para criar um ciclo completo
  @Post('cycle')
  createCycle(@Body() createCycleDto: CreateCycleDto) {
    return this.protocolService.createFullCycle(
      createCycleDto.farmId,
      createCycleDto.animalIds,
      createCycleDto.startDate,
      createCycleDto.technician
    );
  }

  // Endpoint para buscar eventos de calendário
  @Get('calendar-events')
  async getCalendarEvents(@Query('farmId') farmId?: string): Promise<CalendarEventDto[]> {
    return this.protocolService.getCalendarEvents(farmId);
  }

  // Endpoint para buscar protocolos recentes
  @Get('recent')
  async getRecentProtocols(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('farmId') farmId?: string
  ): Promise<RecentProtocolDto[]> {
    return this.protocolService.getRecentProtocols(limit || 5, farmId);
  }

  // Endpoint para buscar métricas do dashboard
  @Get('metrics')
  async getMetrics(@Query('farmId') farmId?: string): Promise<MetricsDto> {
    return this.protocolService.getMetrics(farmId);
  }

  // Endpoint para buscar estatísticas de taxa de prenhez
  @Get('stats/pregnancy-rate')
  async getPregnancyRateStats(
    @Query('months', new ParseIntPipe({ optional: true })) months?: number,
    @Query('farmId') farmId?: string
  ): Promise<PregnancyRateDataDto> {
    return this.protocolService.getPregnancyRateStats(months || 6, farmId);
  }
} 