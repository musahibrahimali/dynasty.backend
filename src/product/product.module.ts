/*
* ########################################################
* ################## IMPORTS #############################
* ########################################################
* */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {Product, ProductSchema} from "./schemas/product.schema";
import {ProductService} from "./product.service";
import {ProductController} from "./product.controller";
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
      * #############################################
      * ############# MONGOOSE MODULE ###############
      * #############################################
      * */
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [
    ProductService
  ],
  exports: [
    ProductService
  ],
  controllers: [ProductController]
})
export class ProductModule {}
