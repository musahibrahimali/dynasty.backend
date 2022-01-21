import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {MongooseModule} from '@nestjs/mongoose';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { RolesGuard } from 'src/auth/auth';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from '../users/users.module';
import { AdminsModule } from 'src/admin/admins.module';
import * as Joi from 'joi';

@Module({
  imports: [
    // other modules
    UsersModule,
    AdminsModule,

    // graphql module
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: 'true',
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
    MongooseModule.forRoot("mongodb://localhost/dynastyurbanstyle",{
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
