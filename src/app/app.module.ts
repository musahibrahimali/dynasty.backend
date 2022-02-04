import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {MongooseModule} from '@nestjs/mongoose';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from 'src/users/users.module';
import { AdminsModule } from 'src/admin/admins.module';
import { config } from 'dotenv';
import { Roles } from 'src/common/common';
import configuration from 'src/common/config/configuration';
import { CaslModule } from 'nest-casl';
import * as Joi from 'joi';
import { ProductsModule } from '../products/products.module';

config();

@Module({
  imports: [
    // other modules
    UsersModule,
    AdminsModule,
    ProductsModule,

    // casl  module configuration
    CaslModule.forRoot<Roles>({
      // Role to grant full access, optional
      superuserRole: Roles.admin,
    }),
 
    // graphql module
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      sortSchema: true,
      playground: true,
      debug: true,
      cors: {
        origin: true,
        credentials: true,
      },
      // add context object for request and response
      context: ({ req, res }) => {
        return {req, res};
      },
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
        // allow unknown keys (change to false to fail on unknown keys)
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    // connect to mongodb database
    MongooseModule.forRoot(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
  ],

  controllers: [AppController],
  providers: [
    AppService,
  ],
})

export class AppModule {}
