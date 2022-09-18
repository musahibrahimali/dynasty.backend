/*
  * #############################################################
  * #################### IMPORTS ################################
  * #############################################################
  * */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../common';
import { MongooseModule } from '@nestjs/mongoose';
import {AdminService} from "./admin.service";
import {AdminController} from "./admin.controller";
import {Admin, AdminSchema} from "./schema/admin.schema";
import {FileModule} from "../file";

@Module({
  imports: [
    /*
    * ####################################################################
    * ########################## CUSTOM MODULE ###########################
    * ####################################################################
    * */
    FileModule,

      /*
      * #############################################################
      * #################### PASSPORT MODULE ########################
      * #############################################################
      * */
    PassportModule.register({ defaultStrategy: 'jwt' }),
    /*
    * #############################################################
    * ######################### JWT MODULE ########################
    * #############################################################
    * */
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
    /*
    * #############################################################
    * #################### MONGOOSE MODULE ########################
    * #############################################################
    * */
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  providers: [
    AdminService,
  ],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
