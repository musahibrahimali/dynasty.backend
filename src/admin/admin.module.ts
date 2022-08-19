/*
  * #############################################################
  * #################### IMPORTS ################################
  * #############################################################
  * */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/common/common';
import { MongooseModule } from '@nestjs/mongoose';
import {Admin, AdminSchema} from "@admin/schema/admin.schema";
import {AdminService} from "@admin/admin.service";
import {AdminController} from "@admin/admin.controller";

@Module({
  imports: [
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
