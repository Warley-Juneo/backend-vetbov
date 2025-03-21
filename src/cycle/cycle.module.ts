import { Module } from '@nestjs/common';
import { CycleService } from './cycle.service';
import { CycleController } from './cycle.controller';
import { CycleRepository } from './cycle.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { ManejoRepository } from '../manejo/manejo.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CycleController],
  providers: [CycleService, CycleRepository, ManejoRepository],
  exports: [CycleService],
})
export class CycleModule {} 