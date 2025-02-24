import { Module } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserController } from 'src/user/user.controller';
import { UserRepository } from 'src/user/user.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
