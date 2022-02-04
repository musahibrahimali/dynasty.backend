import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { permissions } from './auth/product.permissions';
import { CaslModule } from 'nest-casl';

@Module({
  imports: [
    // casl module
    CaslModule.forFeature({permissions}),
    
    // mongoose module
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [
    ProductsResolver, 
    ProductsService
  ],
  exports: [
    ProductsService
  ]
})
export class ProductsModule {}
