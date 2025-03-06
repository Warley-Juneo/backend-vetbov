import { Module } from '@nestjs/common';
import { AnimalController } from './animal.controller';
import { AnimalService } from './animal.service';
import { AnimalRepository } from './animal.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnimalController],
  providers: [AnimalService, AnimalRepository],
  exports: [AnimalService],
})
export class AnimalModule {} 