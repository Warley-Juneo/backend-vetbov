import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FarmModule } from './farm/farm.module';
import { AnimalModule } from './animal/animal.module';
import { ManejoModule } from './manejo/manejo.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CycleModule } from './cycle/cycle.module';
import { OrganizationModule } from './organization/organization.module';
import { OrganizationMiddleware } from './middleware/organization.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule, 
    PrismaModule,
    FarmModule,
    AnimalModule,
    ManejoModule,
    CycleModule,
    AuthModule,
    OrganizationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OrganizationMiddleware)
      .forRoutes('*'); // Aplica o middleware a todas as rotas
  }
}
