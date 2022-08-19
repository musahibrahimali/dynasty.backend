/*
  * ####################################################################
  * ######################## IMPORTS  ##################################
  * ####################################################################
  * */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {jwtConstants, JwtStrategy} from "@common/common";
import {User, UserSchema} from "@user/schema/user.schema";
import {UserService} from "@user/user.service";
import {FacebookStrategy, GoogleStrategy} from "@user/strategies/strategies";
import {UserController} from "@user/user.controller";


@Module({
  imports: [
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
