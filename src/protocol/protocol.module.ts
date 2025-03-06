import { Module } from '@nestjs/common';
import { ProtocolController } from './protocol.controller';
import { ProtocolService } from './protocol.service';
import { ProtocolRepository } from './protocol.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProtocolController],
  providers: [ProtocolService, ProtocolRepository],
  exports: [ProtocolService],
})
export class ProtocolModule {} 