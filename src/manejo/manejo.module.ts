import { Module } from '@nestjs/common';
import { ManejoController } from './manejo.controller';
import { ManejoService } from './manejo.service';
import { ManejoRepository } from './manejo.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CycleModule } from '../cycle/cycle.module';

@Module({
  imports: [PrismaModule, CycleModule],
  controllers: [ManejoController],
  providers: [ManejoService, ManejoRepository],
  exports: [ManejoService],
})
export class ManejoModule {} 