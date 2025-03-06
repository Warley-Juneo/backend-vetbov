import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FarmModule } from './farm/farm.module';
import { AnimalModule } from './animal/animal.module';
import { ProtocolModule } from './protocol/protocol.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule, 
    PrismaModule,
    FarmModule,
    AnimalModule,
    ProtocolModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
