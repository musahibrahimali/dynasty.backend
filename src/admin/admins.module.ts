import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsResolver } from './admins.resolver';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '@common';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './schema/admin.schema';
import { CaslModule } from 'nest-casl';
import { permissions } from './auth/admin.permissions';

@Module({
  imports: [
    // pasport module
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
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  providers: [
    AdminsResolver, 
    AdminsService,
  ],
  exports: [AdminsService],
})
export class AdminsModule {}
