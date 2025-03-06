import { Module, forwardRef } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserController } from 'src/user/user.controller';
import { UserRepository } from 'src/user/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'my-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
