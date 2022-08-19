import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { config } from 'dotenv';
import { CaslModule } from 'nest-casl';
import * as Joi from 'joi';
import {ProductModule} from "@product/product.module";
import {Role, RolesGuard} from "@common/common";
import configuration from "@common/config/configuration";
import {UserModule} from "@user/user.module";
import {AdminModule} from "@admin/admin.module";
import {AppController} from "@app/app.controller";
import {AppService} from "@app/app.service";

config();

@Module({
  imports: [
    // other modules
    UserModule,
    AdminModule,
    ProductModule,

    // casl  module configuration
    CaslModule.forRoot<Role>({
      // Role to grant full access, optional
      superuserRole: Role.Admin, // all admins are super user
    }),

    // configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      expandVariables: true,
      // validate stuff with Joi
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(5000),
      }),
      validationOptions: {
        // allow unknown keys (false to fail on unknown keys)
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    // connect to mongodb database
    MongooseModule.forRoot(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    }
  ],
})

export class AppModule {}
