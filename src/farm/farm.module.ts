import { Module } from '@nestjs/common';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
import { FarmRepository } from './farm.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FarmController],
  providers: [FarmService, FarmRepository],
  exports: [FarmService],
})
export class FarmModule {} 