/*
  * ####################################################################
  * ######################## IMPORTS  ##################################
  * ####################################################################
  * */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {jwtConstants, JwtStrategy} from "../common";
import {User, UserSchema} from "./schema/user.schema";
import {UserService} from "./user.service";
import {FacebookStrategy, GoogleStrategy} from "./strategies";
import {UserController} from "./user.controller";
import {PaymentModule} from "../payment";
import {FileModule} from "../file";


@Module({
  imports: [
      /*
      * ####################################################################
      * ########################## CUSTOM MODULE ###########################
      * ####################################################################
      * */
      PaymentModule,
      FileModule,

      /*
      * ####################################################################
      * ######################## PASSPORT MODULE ###########################
      * ####################################################################
      * */
      PassportModule.register({ defaultStrategy: 'jwt' }),
      /*
      * ####################################################################
      * ######################## JWT MODULE ################################
      * ####################################################################
      * */
      JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: jwtConstants.expiresIn },
      }),
      /*
      * ####################################################################
      * ######################## MONGOOSE MODULE ###########################
      * ####################################################################
      * */
      MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
      ]),
  ],
  /*
    * ####################################################################
    * ######################## PROVIDERS #################################
    * ####################################################################
    * */
  providers: [
    UserService,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
  /*
    * ####################################################################
    * ######################## CONTROLLERS  ##############################
    * ####################################################################
    * */
  controllers: [UserController],
  /*
    * ####################################################################
    * ######################## EXPORTS ###################################
    * ####################################################################
    * */
  exports: [UserService],
})
export class UserModule {}
