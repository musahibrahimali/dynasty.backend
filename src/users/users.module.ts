import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '@common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { JwtStrategy } from './strategies/strategies';
import { CaslModule } from 'nest-casl';
import { permissions } from './auth/user.permissions';
@Module({
  imports: [
    // passport module
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // jwt module
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
    // casl module
    CaslModule.forFeature({permissions}),
    // mongoose module
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    UsersResolver, 
    UsersService,
    JwtStrategy,
  ],
  exports: [UsersService],
})
export class UsersModule {}
