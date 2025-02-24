import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
