import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {MongooseModule} from '@nestjs/mongoose';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from '@users/users.module';
import { AdminsModule } from '@admin/admins.module';
import { config } from 'dotenv';
import {Roles, upperCaseDirectiveTransformer, configuration} from '@common';
import { CaslModule } from 'nest-casl';
import * as Joi from 'joi';
import { ProductsModule } from '@products/products.module';
import {ApolloServerPluginLandingPageLocalDefault} from "apollo-server-core";
import {ApolloDriver, ApolloDriverConfig} from "@nestjs/apollo";
import { join } from 'path/posix';
import { ServeStaticModule } from '@nestjs/serve-static';

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
      superuserRole: Roles.admin, // all admins are superusers
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
 
    // graphql module
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      sortSchema: true,
      playground: false,
      plugins: [
        ApolloServerPluginLandingPageLocalDefault()
      ],
      debug: true,
      cors: {
        origin: true,
        credentials: true,
      },
      // add context object for request and response
      context: ({ req, res }) => {
        return {req, res};
      },
      transformSchema: (schema) => upperCaseDirectiveTransformer(schema, 'upper'),
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
        // allow unknown keys (change to false, fail on unknown keys)
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
  ],
})

export class AppModule {}
