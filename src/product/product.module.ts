/*
* ########################################################
* ################## IMPORTS #############################
* ########################################################
* */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {Product, ProductSchema} from "@product/schemas/product.schema";
import {ProductService} from "@product/product.service";
import {ProductController} from "@product/product.controller";

@Module({
  imports: [
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
